import Decimal from "decimal.js";

import { and, eq, ne, schema, sql } from "@repo/db";

import { db } from "../../../db";
import { InventoryBatchProcessor } from "./inventory";

const USER_ID = "b0e69002-1391-462e-ac20-11e640ff81a1";

// const { stockItem } = bitSystemsSchema;

interface StockTransaction {
  id: number;
  componentId: string;
  quantity: Decimal;
  date: Date;
  reference: string | null;
  referenceNumeric: number | null;
  details: string | null;
  type: "correction" | "production" | "receipt" | "despatch";
  createdAt: Date;
  lastModified: Date;
}

const getTransactions = async (): Promise<StockTransaction[]> => {
  return await db.query.STOCK_TRAN.findMany().then((transactions) => {
    return transactions
      .filter(
        (
          t,
        ): t is typeof t & {
          STOCK_CODE: string;
          TYPE: string;
          DATE: Date;
          QUANTITY: number;
        } => {
          return !(
            !t.STOCK_CODE ||
            !t.TYPE ||
            !t.DATE ||
            !t.QUANTITY ||
            t.TYPE === "DI"
          );
        },
      )
      .map((t) => {
        let type: "correction" | "production" | "receipt" | "despatch" =
          "correction";
        if (t.TYPE.startsWith("M") || t.REFERENCE?.startsWith("BOM")) {
          type = "production";
        } else if (t.TYPE === "GI") {
          type = "receipt";
        } else if (t.TYPE === "GO") {
          type = "despatch";
        }
        return {
          id: t.TRAN_NUMBER,
          componentId: t.STOCK_CODE,
          quantity: new Decimal(t.QUANTITY).toDP(6),
          date: t.DATE,
          reference: t.REFERENCE,
          referenceNumeric: t.REFERENCE_NUMERIC,
          details: t.DETAILS,
          type,
          createdAt: t.RECORD_CREATE_DATE ?? t.DATE,
          lastModified: t.RECORD_MODIFY_DATE ?? t.RECORD_CREATE_DATE ?? t.DATE,
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.date.setHours(0, 0, 0, 0));
        const dateB = new Date(b.date.setHours(0, 0, 0, 0));
        const dateDiff = dateA.getTime() - dateB.getTime();
        if (dateDiff !== 0) return dateDiff;

        // If same day, sort by quantity sign (positive first)
        const aIsPositive = a.quantity.isPositive();
        const bIsPositive = b.quantity.isPositive();
        if (aIsPositive !== bIsPositive) {
          return aIsPositive ? -1 : 1;
        }

        // If same sign, sort by time within the day
        return a.date.getTime() - b.date.getTime();
      });
  });
};

// const getBitSystemsComponentId = async (componentId: string) => {
//   return await db.query.stockItem
//     .findFirst({
//       where: eq(stockItem.Code, componentId),
//     })
//     .then((item) => {
//       if (!item) return undefined;
//       return item.pk_StockItem_ID;
//     });
// };

interface Inventory {
  totalQuantity: Decimal;
  batchTracked: boolean;
  items: {
    locationId: number;
    quantity: Decimal;
    batchReference?: string;
    createdAt?: Date;
  }[];
}
const getCurrentInventory = async (componentId: string) => {
  const sageQuantity = await db.query.STOCK.findFirst({
    where: and(eq(schema.STOCK.STOCK_CODE, componentId)),
  });
  if (!(sageQuantity && sageQuantity.QTY_IN_STOCK !== null)) {
    throw new Error("Sage quantity not found");
  }

  const inventory: Inventory = {
    totalQuantity: new Decimal(sageQuantity.QTY_IN_STOCK).toDP(6),
    batchTracked: false,
    items: [],
  };

  const bitSystemsStock = await db.query.stockItem.findFirst({
    where: eq(schema.stockItem.Code, componentId),
  });

  if (bitSystemsStock) {
    const hasTraceableItem = await db.query.traceableItem.findFirst({
      where: eq(
        schema.traceableItem.fk_StockItem_ID,
        bitSystemsStock.pk_StockItem_ID,
      ),
    });

    if (hasTraceableItem) {
      inventory.batchTracked = true;
      inventory.items = await db
        .select({
          locationId: schema.bin.pk_Bin_ID,
          quantity: schema.traceableBinItem.QuantityInStock,
          batchReference: schema.traceableItem.IdentificationNo,
          createdAt: schema.traceableItem.DateTimeCreated,
        })
        .from(schema.traceableItem)
        .leftJoin(
          schema.traceableBinItem,
          eq(
            schema.traceableItem.pk_TraceableItem_ID,
            schema.traceableBinItem.fk_TraceableItem_ID,
          ),
        )
        .leftJoin(
          schema.binItem,
          eq(
            schema.traceableBinItem.fk_BinItem_ID,
            schema.binItem.pk_BinItem_ID,
          ),
        )
        .leftJoin(
          schema.bin,
          eq(schema.binItem.fk_Bin_ID, schema.bin.pk_Bin_ID),
        )
        .where(
          and(
            eq(
              schema.traceableItem.fk_StockItem_ID,
              bitSystemsStock.pk_StockItem_ID,
            ),
            ne(schema.traceableBinItem.QuantityInStock, 0),
            ne(schema.bin.fk_Warehouse_ID, 1),
          ),
        )
        .then((items) => {
          return items
            .filter(
              (
                item,
              ): item is typeof item & {
                locationId: number;
                quantity: number;
                batchReference: string | null;
              } => {
                return item.locationId !== null && item.quantity !== null;
              },
            )
            .map((item) => {
              return {
                locationId: item.locationId,
                quantity: new Decimal(item.quantity).toDP(6),
                batchReference: item.batchReference ?? undefined,
              };
            });
        });
    } else {
      inventory.items = await db
        .select({
          locationId: schema.bin.pk_Bin_ID,
          quantity: schema.binItem.QuantityInStock,
        })
        .from(schema.binItem)
        .leftJoin(
          schema.bin,
          eq(schema.binItem.fk_Bin_ID, schema.bin.pk_Bin_ID),
        )
        .where(
          and(
            eq(schema.binItem.fk_StockItem_ID, bitSystemsStock.pk_StockItem_ID),
            ne(schema.binItem.QuantityInStock, 0),
            ne(schema.bin.fk_Warehouse_ID, 1),
          ),
        )
        .then((items) => {
          return items
            .filter(
              (
                item,
              ): item is typeof item & {
                locationId: number;
                quantity: number;
                batchReference: string | null;
              } => {
                return item.locationId !== null && item.quantity !== null;
              },
            )
            .map((item) => {
              return {
                locationId: item.locationId,
                quantity: new Decimal(item.quantity).toDP(6),
              };
            });
        });
    }
  }

  return inventory;
};

const handleReceiptTransaction = (
  transaction: StockTransaction,
  processor: InventoryBatchProcessor,
  orderIds: number[],
) => {
  if (!orderIds.includes(transaction.referenceNumeric ?? 0)) {
    handleCorrectionTransaction(transaction, processor);
    return;
  }

  const receipt = processor.purchaseReceiptRepository.upsert({
    id: 0,
    orderId: transaction.referenceNumeric ?? 0,
    receiptDate: transaction.date,
    createdAt: transaction.createdAt,
    lastModified: transaction.lastModified,
  });

  const receiptItem = processor.purchaseReceiptItemRepository.upsert({
    id: 0,
    receiptId: receipt.id,
    componentId: transaction.componentId,
    quantity: transaction.quantity,
    createdAt: transaction.createdAt,
    lastModified: transaction.lastModified,
  });

  const entry = processor.createInboundEntry(
    {
      componentId: transaction.componentId,
      batchId: null,
    },
    1, // locationId
    transaction.quantity,
    transaction.date,
    transaction.createdAt,
    transaction.lastModified,
    receiptItem.id,
  );

  processor.logToLedger("inbound", entry, {
    type: "receipt",
    userId: USER_ID,
    date: transaction.date,
  });

  processor.updateInventory(entry, "inbound");
};

const handleDespatchTransaction = (
  transaction: StockTransaction,
  processor: InventoryBatchProcessor,
  orderIds: number[],
) => {
  if (!orderIds.includes(transaction.referenceNumeric ?? 0)) {
    handleCorrectionTransaction(transaction, processor);
    return;
  }

  const despatch = processor.salesDespatchRepository.upsert({
    id: 0,
    orderId: transaction.referenceNumeric ?? 0,
    despatchDate: transaction.date,
    createdAt: transaction.createdAt,
    lastModified: transaction.lastModified,
    expectedDespatchDate: null,
    isDespatched: false,
    isCancelled: false,
  });
  const despatchItem = processor.salesDespatchItemRepository.upsert({
    id: 0,
    despatchId: despatch.id,
    componentId: transaction.componentId,
    quantity: transaction.quantity.abs(),
    batchId: null,
    createdAt: transaction.createdAt,
    lastModified: transaction.lastModified,
  });

  const entry = processor.calculateOutboundEntry(
    {
      componentId: transaction.componentId,
      batchId: null,
    },
    1, // locationId
    transaction.quantity.abs(),
  );

  processor.logToLedger("outbound", entry, {
    type: "despatch",
    userId: USER_ID,
    salesDespatchItemId: despatchItem.id,
    date: transaction.date,
  });

  processor.updateInventory(entry, "outbound");
};

const handleProductionTransaction = (
  transaction: StockTransaction,
  processor: InventoryBatchProcessor,
) => {
  if (transaction.quantity.isPositive()) {
    handleJobOutputTransaction(transaction, processor);
  } else {
    handleJobInputTransaction(transaction, processor);
  }
};

const handleJobInputTransaction = (
  transaction: StockTransaction,
  processor: InventoryBatchProcessor,
) => {
  const job = processor.productionJobRepository.upsert({
    id: 0,
    componentId: transaction.details ?? transaction.componentId,
    createdAt: transaction.createdAt,
    lastModified: transaction.date,
    batchId: null,
    outputLocationId: 1,
    targetQuantity: new Decimal(0),
    quantityProduced: new Decimal(0),
    isComplete: true,
  });

  const jobInput = processor.productionJobAllocationRepository.upsert({
    id: 0,
    productionJobId: job.id,
    componentId: transaction.componentId,
    locationId: 1,
    totalQuantity: transaction.quantity.abs(),
    remainingQuantity: new Decimal(0),
    usedQuantity: transaction.quantity.abs(),
    createdAt: transaction.createdAt,
    lastModified: transaction.lastModified,
    batchId: null,
  });

  const entry = processor.calculateOutboundEntry(
    {
      componentId: transaction.componentId,
      batchId: null,
    },
    1,
    transaction.quantity.abs(),
  );

  processor.logToLedger("outbound", entry, {
    type: "production",
    userId: USER_ID,
    productionJobAllocationId: jobInput.id,
    date: transaction.date,
  });

  processor.updateInventory(entry, "outbound");
};

const handleJobOutputTransaction = (
  transaction: StockTransaction,
  processor: InventoryBatchProcessor,
) => {
  const job = processor.productionJobRepository.upsert({
    id: 0,
    componentId: transaction.componentId,
    createdAt: transaction.createdAt,
    lastModified: transaction.date,
    batchId: null,
    outputLocationId: 1,
    targetQuantity: new Decimal(0),
    quantityProduced: new Decimal(0),
    isComplete: true,
  });

  const entry = processor.createInboundEntry(
    {
      componentId: transaction.componentId,
      batchId: null,
    },
    1,
    transaction.quantity,
    transaction.date,
    transaction.createdAt,
    transaction.lastModified,
    undefined,
    job.id,
  );

  processor.logToLedger("inbound", entry, {
    type: "production",
    userId: USER_ID,
    date: transaction.date,
  });

  processor.updateInventory(entry, "inbound");
};

const handleCorrectionTransaction = (
  transaction: StockTransaction,
  processor: InventoryBatchProcessor,
) => {
  if (transaction.quantity.isPositive()) {
    const entry = processor.createInboundEntry(
      {
        componentId: transaction.componentId,
        batchId: null,
      },
      1,
      transaction.quantity,
      transaction.date,
      transaction.createdAt,
      transaction.lastModified,
    );

    processor.logToLedger("inbound", entry, {
      type: "correction",
      userId: USER_ID,
      date: transaction.date,
    });

    processor.updateInventory(entry, "inbound");
  } else {
    const entry = processor.calculateOutboundEntry(
      {
        componentId: transaction.componentId,
        batchId: null,
      },
      1,
      transaction.quantity.abs(),
    );

    processor.logToLedger("outbound", entry, {
      type: "correction",
      userId: USER_ID,
      date: transaction.date,
    });

    processor.updateInventory(entry, "outbound");
  }
};

export const resetInventory = async () => {
  console.log("Resetting inventory");
  await db.execute(
    sql`TRUNCATE TABLE 
      ${schema.inventory},
      ${schema.inventoryLedger},
      ${schema.inventoryLot},
      ${schema.inventoryLotLedger},
      ${schema.componentLot},
      ${schema.batch},
      ${schema.productionJobAllocation},
      ${schema.salesDespatchItem},
      ${schema.purchaseReceiptItem},
      ${schema.purchaseReceipt},
      ${schema.salesDespatch},
      ${schema.productionJob}
    RESTART IDENTITY CASCADE`,
  );

  const processor = new InventoryBatchProcessor();

  console.log("Getting transactions");

  const transactions = await getTransactions();
  const purchaseOrderIds = await db.query.purchaseOrder
    .findMany({
      columns: {
        id: true,
      },
    })
    .then((orders) => {
      return orders.map((order) => order.id);
    });

  const salesOrderIds = await db.query.salesOrder
    .findMany({
      columns: {
        id: true,
      },
    })
    .then((orders) => {
      return orders.map((order) => order.id);
    });

  console.log("Processing transactions");
  let index = 0;

  for (const transaction of transactions) {
    index++;
    try {
      switch (transaction.type) {
        case "receipt":
          handleReceiptTransaction(transaction, processor, purchaseOrderIds);
          break;
        case "despatch":
          handleDespatchTransaction(transaction, processor, salesOrderIds);
          break;
        case "production":
          handleProductionTransaction(transaction, processor);
          break;
        case "correction":
          handleCorrectionTransaction(transaction, processor);
          break;
      }
    } catch (error) {
      console.log(transaction);
      console.error(
        `Error processing transaction ${transaction.id} for ${transaction.componentId}:`,
        error,
      );
      throw error;
    }
    if (index % 1000 === 0) {
      console.log(`Processed ${index} transactions`);
    }
  }

  try {
    await processor.saveAll();
  } catch (error) {
    console.error("Error saving inventory", error);
    throw error;
  }
};
