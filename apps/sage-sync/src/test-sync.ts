import fs from "fs";
import { constrainedMemory } from "process";
import { createId } from "@paralleldrive/cuid2";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/StreamArray";
import { compareTwoStrings } from "string-similarity";

import schema from "@repo/db/schema";

import {
  Bin,
  StockItem,
  TraceableItem,
  Warehouse,
} from "./lib/bit-systems/types";
import {
  GDN_ITEM,
  GRN_ITEM,
  POP_ITEM,
  PURCHASE_LEDGER,
  PURCHASE_ORDER,
  SALES_LEDGER,
  SALES_ORDER,
  SOP_ITEM,
  STOCK,
  STOCK_TRAN,
} from "./lib/sage/types";

const processFile = async <T extends object>(
  filePath: string,
  processItem: (item: T) => void,
) => {
  return new Promise<void>((resolve, reject) => {
    const pipeline = chain([
      fs.createReadStream(filePath),
      parser(),
      streamArray(),
    ]);

    pipeline.on("data", ({ value }) => {
      processItem(value);
    });

    pipeline.on("end", resolve);
    pipeline.on("error", reject);
  });
};

let currentId = 0;

const ignoredStockCodes = new Set<string>(["S1", "S2", "S3", "M"]);

const main = async () => {
  const components = new Map<
    string,
    typeof schema.component.$inferInsert & {
      _data: {
        transactions: (STOCK_TRAN & {
          _productionJobId?: number;
          _type:
            | "receipt"
            | "despatch"
            | "production"
            | "wastage"
            | "transfer"
            | "correction"
            | "lost"
            | "found"
            | "return"
            | "unknown";
        })[];
      };
      _connected: {
        subcomponents: {
          id: string;
          quantity: number;
        }[];
        batches: (typeof schema.batch.$inferInsert & {
          _connected: {
            movements: (typeof schema.batchMovement.$inferInsert)[];
          };
        })[];
        purchaseOrderItems: (typeof schema.purchaseOrderItem.$inferInsert & {
          _connected: {
            receiptItems: (typeof schema.purchaseReceiptItem.$inferInsert)[];
            expectedReceiptDate: Date | undefined;
          };
        })[];
        salesOrderItems: (typeof schema.salesOrderItem.$inferInsert & {
          _connected: {
            despatchItems: (typeof schema.salesDespatchItem.$inferInsert)[];
            expectedDespatchDate: Date | undefined;
          };
        })[];
      };
    }
  >();

  const suppliers = new Map<string, typeof schema.supplier.$inferInsert>();

  const purchaseOrders = new Map<
    number,
    typeof schema.purchaseOrder.$inferInsert
  >();

  const purchaseReceipts = new Map<
    number,
    (typeof schema.purchaseReceipt.$inferInsert & {
      _connected: {
        items: (typeof schema.purchaseReceiptItem.$inferInsert)[];
      };
    })[]
  >();

  const customers = new Map<string, typeof schema.customer.$inferInsert>();

  const salesOrders = new Map<number, typeof schema.salesOrder.$inferInsert>();

  const salesDespatches = new Map<
    number,
    (typeof schema.salesDespatch.$inferInsert & {
      _connected: {
        items: (typeof schema.salesDespatchItem.$inferInsert)[];
      };
    })[]
  >();

  const locationGroups = new Map<
    number,
    typeof schema.locationGroup.$inferInsert
  >();

  const locations = new Map<number, typeof schema.location.$inferInsert>();

  const componentMap = new Map<number, string>();

  await processFile<STOCK>("./data/StockComponent.json", (item) => {
    components.set(item.STOCK_CODE, {
      id: item.STOCK_CODE,
      description: item.DESCRIPTION,
      categoryId: item.STOCK_CAT,
      unit: item.UNIT_OF_SALE,
      hasSubcomponents: item.HAS_BOM === "Y",
      sageQuantity: item.QTY_IN_STOCK,
      departmentId: item.DEPT_NUMBER,
      _data: {
        transactions: [],
      },
      _connected: {
        purchaseOrderItems: [],
        salesOrderItems: [],
        batches: [],
        subcomponents: Array.from({ length: 50 })
          .map((_, i) => ({
            id: item[`COMPONENT_CODE_${i}` as keyof STOCK] as string,
            quantity: item[`COMPONENT_QTY_${i}` as keyof STOCK] as number,
          }))
          .filter(
            (subcomponent) =>
              subcomponent.id !== null && subcomponent.quantity !== null,
          ),
      },
    });
  });

  await processFile<PURCHASE_LEDGER>("./data/PurchaseLedger.json", (item) => {
    suppliers.set(item.ACCOUNT_REF, {
      id: item.ACCOUNT_REF,
      name: item.NAME,
    });
  });

  await processFile<PURCHASE_ORDER>("./data/PurchaseOrder.json", (item) => {
    purchaseOrders.set(item.ORDER_NUMBER, {
      id: item.ORDER_NUMBER,
      supplierId: item.ACCOUNT_REF,
      orderDate: new Date(item.ORDER_DATE),
      isQuote: item.ORDER_OR_QUOTE !== "Purchase Order",
      isCancelled: item.ORDER_STATUS === "Cancelled",
      isComplete: item.DELIVERY_STATUS === "Complete",
    });
  });

  await processFile<POP_ITEM>("./data/PurchaseOrderItem.json", (item) => {
    if (ignoredStockCodes.has(item.STOCK_CODE)) {
      return;
    }

    const component = components.get(item.STOCK_CODE);
    if (!component) {
      console.error(
        `Component not found for purchase order item ${item.STOCK_CODE}`,
      );
      return;
    }

    component._connected.purchaseOrderItems.push({
      id: item.ITEMID,
      componentId: item.STOCK_CODE,
      quantityOrdered: item.QTY_ORDER,
      orderId: item.ORDER_NUMBER,
      _connected: {
        receiptItems: [],
        expectedReceiptDate: item.DUE_DATE
          ? new Date(item.DUE_DATE)
          : undefined,
      },
    });
  });

  await processFile<GRN_ITEM>("./data/GRNItem.json", (item) => {
    if (ignoredStockCodes.has(item.STOCK_CODE)) {
      return;
    }
    const component = components.get(item.STOCK_CODE);
    if (!component) {
      console.error(`Component not found for GRN item ${item.STOCK_CODE}`);
      return;
    }

    const purchaseOrderItem = component._connected.purchaseOrderItems.find(
      (poi) => poi.orderId === item.ORDER_NUMBER,
    );
    if (!purchaseOrderItem) {
      console.error(
        `Purchase order item not found for Order ${item.ORDER_NUMBER}`,
      );
      return;
    }

    if (!purchaseReceipts.has(item.ORDER_NUMBER)) {
      purchaseReceipts.set(item.ORDER_NUMBER, []);
    }

    const receipts = purchaseReceipts.get(item.ORDER_NUMBER)!;
    const date = new Date(item.DATE);
    let receipt = receipts.find(
      (r) => r.receiptDate && r.receiptDate.getTime() === date.getTime(),
    );

    if (!receipt) {
      const index = receipts.push({
        id: currentId++,
        orderId: item.ORDER_NUMBER,
        receiptDate: date,
        expectedReceiptDate: purchaseOrderItem._connected.expectedReceiptDate,
        _connected: {
          items: [],
        },
      });
      receipt = receipts[index - 1]!;
    }

    purchaseOrderItem._connected.receiptItems.push({
      id: currentId++,
      batchId: 0,
      // date,
      receiptId: receipt.id!,
      quantity: item.QTY_RECEIVED,
    });
  });

  await processFile<SALES_LEDGER>("./data/SalesLedger.json", (item) => {
    customers.set(item.ACCOUNT_REF.toString(), {
      id: item.ACCOUNT_REF,
      name: item.NAME,
    });
  });

  await processFile<SALES_ORDER>("./data/SalesOrder.json", (item) => {
    salesOrders.set(item.ORDER_NUMBER, {
      id: item.ORDER_NUMBER,
      customerId: item.ACCOUNT_REF,
      orderDate: new Date(item.ORDER_DATE),
      isQuote: item.ORDER_OR_QUOTE !== "Sales Order",
      isCancelled: item.ORDER_TYPE_CODE !== 2,
      isComplete: item.DESPATCH_STATUS === "Complete",
    });
  });

  await processFile<SOP_ITEM>("./data/SalesOrderItem.json", (item) => {
    if (ignoredStockCodes.has(item.STOCK_CODE)) {
      return;
    }

    const component = components.get(item.STOCK_CODE);
    if (!component) {
      console.error(
        `Component not found for purchase order item ${item.STOCK_CODE}`,
      );
      return;
    }

    component._connected.salesOrderItems.push({
      id: item.ITEMID,
      componentId: item.STOCK_CODE,
      quantityOrdered: item.QTY_ORDER || 0,
      sageQuantityDespatched: item.QTY_DESPATCH || 0,
      orderId: item.ORDER_NUMBER,
      _connected: {
        despatchItems: [],
        expectedDespatchDate: item.DUE_DATE
          ? new Date(item.DUE_DATE)
          : undefined,
      },
    });
  });

  await processFile<GDN_ITEM>("./data/GDNItem.json", (item) => {
    if (ignoredStockCodes.has(item.STOCK_CODE)) {
      return;
    }
    const component = components.get(item.STOCK_CODE);
    if (!component) {
      console.error(`Component not found for GRN item ${item.STOCK_CODE}`);
      return;
    }

    const salesOrderItem = component._connected.salesOrderItems.find(
      (soi) => soi.orderId === item.ORDER_NUMBER,
    );
    if (!salesOrderItem) {
      console.error(
        `Sales order item not found for Order ${item.ORDER_NUMBER}`,
      );
      return;
    }

    if (!salesDespatches.has(item.ORDER_NUMBER)) {
      salesDespatches.set(item.ORDER_NUMBER, []);
    }

    const despatches = salesDespatches.get(item.ORDER_NUMBER)!;
    const date = new Date(item.DATE);
    let despatch = despatches.find(
      (r) => r.despatchDate && r.despatchDate.getTime() === date.getTime(),
    );

    if (!despatch) {
      const index = despatches.push({
        id: currentId++,
        orderId: item.ORDER_NUMBER,
        despatchDate: date,
        expectedDespatchDate: salesOrderItem._connected.expectedDespatchDate,
        _connected: {
          items: [],
        },
      });
      despatch = despatches[index - 1]!;
    }

    salesOrderItem._connected.despatchItems.push({
      id: currentId++,
      batchId: 0,
      despatchId: despatch.id!,
      quantity: item.QTY_DESPATCHED,
    });
  });

  await processFile<StockItem>("./data/bit/StockItems.json", (item) => {
    componentMap.set(item.pk_StockItem_ID, item.Code);
  });

  await processFile<Warehouse>("./data/bit/Warehouses.json", (item) => {
    locationGroups.set(item.pk_Warehouse_ID, {
      id: item.pk_Warehouse_ID,
      name: item.Name,
    });
  });

  await processFile<Bin>("./data/bit/Bins.json", (item) => {
    locations.set(item.pk_Bin_ID, {
      id: item.pk_Bin_ID,
      name: item.Name,
      groupId: item.fk_Warehouse_ID,
      typeId: 1,
    });
  });

  await processFile<TraceableItem>("./data/bit/TraceableItems.json", (item) => {
    const componentId = componentMap.get(item.fk_StockItem_ID);
    if (!componentId) {
      console.error(`Component not found for item ${item.pk_TraceableItem_ID}`);
      return;
    }

    const component = components.get(componentId);
    if (!component) {
      console.error(`Component not found for item ${componentId}`);
      return;
    }

    // component._connected.batches.push({
    //   id: item.pk_TraceableItem_ID,
    //   componentId,
    //   entryDate: new Date(item.DateTimeCreated),
    //   batchReference: item.IdentificationNo,
    // });
  });

  const productionJobs = new Map<
    number,
    {
      id: number;
      componentId: string;
      quantity: number;
      date: Date;
      batchId?: string;
      subComponents: {
        componentId: string;
        quantity: number;
      }[];
    }
  >();

  const transactions: STOCK_TRAN[] = [];

  await processFile<STOCK_TRAN>("./data/StockTransaction.json", (item) => {
    transactions.push(item);
  });

  transactions.sort((a, b) => a.TRAN_NUMBER - b.TRAN_NUMBER);

  let unmatchedManufacturingOut: STOCK_TRAN[] = [];

  for (const transaction of transactions) {
    const component = components.get(transaction.STOCK_CODE);
    if (!component) {
      console.error(
        `Component not found for transaction ${transaction.STOCK_CODE}`,
      );
      continue;
    }

    const type = transaction.TYPE;
    const reference = transaction.REFERENCE.toLowerCase();
    const details = transaction.DETAILS.toLowerCase();

    if (
      type === "MO" ||
      reference === "bom out (pss)" ||
      (reference.includes("build") && transaction.QUANTITY < 0)
    ) {
      unmatchedManufacturingOut.push(transaction);
    } else if (
      type === "MI" ||
      reference === "bom in (pss)" ||
      (reference.includes("build") && transaction.QUANTITY > 0)
    ) {
      const productionJobId = currentId++;

      productionJobs.set(productionJobId, {
        id: productionJobId,
        componentId: transaction.STOCK_CODE,
        quantity: transaction.QUANTITY,
        date: new Date(transaction.DATE),
        subComponents: unmatchedManufacturingOut.map((out) => ({
          componentId: out.STOCK_CODE,
          quantity: -out.QUANTITY,
        })),
      });

      component._data.transactions.push({
        ...transaction,
        _productionJobId: productionJobId,
        _type: "production",
      });

      unmatchedManufacturingOut.forEach((out) => {
        const subComponent = components.get(out.STOCK_CODE);
        if (!subComponent) {
          console.error(`Component not found for item ${out.STOCK_CODE}`);
          return;
        }

        subComponent._data.transactions.push({
          ...out,
          _productionJobId: productionJobId,
          _type: "production",
        });
      });

      unmatchedManufacturingOut = [];
    } else if (["stk take", "stock take", "stock"].includes(reference)) {
      component._data.transactions.push({
        ...transaction,
        _type: "correction",
      });
    } else if (type === "GI" || details.startsWith("goods in")) {
      component._data.transactions.push({
        ...transaction,
        _type: "receipt",
      });
    } else if (type === "GO" || details.startsWith("goods out")) {
      component._data.transactions.push({
        ...transaction,
        _type: "despatch",
      });
    } else if (type === "GR" || details.startsWith("goods return")) {
      component._data.transactions.push({
        ...transaction,
        _type: "return",
      });
    } else {
      component._data.transactions.push({
        ...transaction,
        _type: "unknown",
      });
    }
  }

  for (const component of components.values()) {
    if (component.id !== "1720248-B") {
      continue;
    }
    const batches = [];

    let currentStock = 0;
    for (const transaction of component._data.transactions) {
      if (transaction._type === "receipt") {
        // const grnItem = component._connected.purchaseOrderItems.find(
        //   (poi) => poi._connected.receiptItems.find(
        //     (ri) => ri. === transaction.REFERENCE,
        //   ),
        // );
        // if (!grnItem) {
        //   console.error(
        //     `Purchase order item not found for Order ${transaction.REFERENCE}`,
        //   );
        //   continue;
        // }

        batches.push({
          id: ++currentId,
          date: transaction.DATE,
          quantity: transaction.QUANTITY,
          _remaining: transaction.QUANTITY,
          _transactions: [
            {
              quantity: transaction.QUANTITY,
              type: transaction._type,
              date: new Date(transaction.DATE),
            },
          ],
        });
      }
      currentStock += transaction.QUANTITY;
      console.log(
        `${transaction.DATE} ${transaction._type} ${transaction.QUANTITY} -> ${currentStock} - ${transaction.REFERENCE} - ${transaction.DETAILS}`,
      );
    }
  }
};

main();
