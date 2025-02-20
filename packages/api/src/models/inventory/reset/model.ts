import Decimal from "decimal.js";

import { eq, schema, sql } from "@repo/db";

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

interface InventoryItem {
  locationId: number;
  quantity: Decimal;
  batchReference?: string;
  createdAt: Date;
}

interface TargetInventory {
  componentId: string;
  totalQuantity: Decimal;
  batchTracked: boolean;
  items: InventoryItem[];
}

const getCurrentInventory = async (): Promise<TargetInventory[]> => {
  return await db
    .select({
      componentId: schema.STOCK.STOCK_CODE,
      totalQuantity: schema.STOCK.QTY_IN_STOCK,
      batchTracked: sql<boolean>`EXISTS (
        SELECT 1 FROM ${schema.traceableItem} ti 
        WHERE ti."fk_StockItem_ID" = ${schema.stockItem.pk_StockItem_ID}
      )`,
      items: sql<InventoryItem[]>`
        COALESCE(
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM ${schema.traceableItem} ti 
              WHERE ti."fk_StockItem_ID" = ${schema.stockItem.pk_StockItem_ID}
            ) THEN (
              SELECT json_agg(
                json_build_object(
                  'locationId', b."pk_Bin_ID",
                  'quantity', tbi."QuantityInStock",
                  'batchReference', ti."IdentificationNo",
                  'createdAt', ti."DateTimeCreated"
                )
              )
              FROM ${schema.traceableItem} ti
              LEFT JOIN ${schema.traceableBinItem} tbi ON ti."pk_TraceableItem_ID" = tbi."fk_TraceableItem_ID"
              LEFT JOIN ${schema.binItem} bi ON tbi."fk_BinItem_ID" = bi."pk_BinItem_ID"
              LEFT JOIN ${schema.bin} b ON bi."fk_Bin_ID" = b."pk_Bin_ID"
              WHERE ti."fk_StockItem_ID" = ${schema.stockItem.pk_StockItem_ID}
              AND tbi."QuantityInStock" != 0
              AND b."fk_Warehouse_ID" != 1
            )
            ELSE (
              SELECT json_agg(
                json_build_object(
                  'locationId', b."pk_Bin_ID",
                  'quantity', bi."QuantityInStock"
                )
              )
              FROM ${schema.binItem} bi
              LEFT JOIN ${schema.bin} b ON bi."fk_Bin_ID" = b."pk_Bin_ID"
              WHERE bi."fk_StockItem_ID" = ${schema.stockItem.pk_StockItem_ID}
              AND bi."QuantityInStock" != 0
              AND b."fk_Warehouse_ID" != 1
            )
          END,
          '[]'
        )`,
    })
    .from(schema.STOCK)
    .leftJoin(
      schema.stockItem,
      eq(schema.stockItem.Code, schema.STOCK.STOCK_CODE),
    )
    .then((inventory) => {
      return inventory.map((item) => {
        return {
          ...item,
          totalQuantity: new Decimal(item.totalQuantity ?? 0).toDP(6),
          items: item.items.map((i) => ({
            ...i,
            quantity: new Decimal(i.quantity).toDP(6),
            createdAt: i.createdAt ? new Date(i.createdAt) : new Date(),
          })),
        };
      });
    });
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
  inventory: TargetInventory[],
) => {
  if (transaction.quantity.isPositive()) {
    handleJobOutputTransaction(transaction, processor, inventory);
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
  inventory: TargetInventory[],
) => {
  const inventoryItems = inventory
    .find((i) => i.componentId === transaction.componentId)
    ?.items.sort((a, b) => {
      // Calculate absolute time difference from transaction date
      const aDiff = Math.abs(
        a.createdAt.getTime() - transaction.date.getTime(),
      );
      const bDiff = Math.abs(
        b.createdAt.getTime() - transaction.date.getTime(),
      );
      return aDiff - bDiff; // Closest dates first
    });

  const item = inventoryItems?.[0];

  let batchId = null;

  if (item?.batchReference) {
    const batch = processor.batches.upsert({
      id: 0,
      componentId: transaction.componentId,
      batchReference: item.batchReference,
      createdAt: item.createdAt,
      lastModified: item.createdAt,
    });

    batchId = batch.id;
  }

  const job = processor.productionJobRepository.upsert({
    id: 0,
    componentId: transaction.componentId,
    createdAt: transaction.createdAt,
    lastModified: transaction.date,
    batchId,
    outputLocationId: 1,
    targetQuantity: new Decimal(0),
    quantityProduced: new Decimal(0),
    isComplete: true,
  });

  const entry = processor.createInboundEntry(
    {
      componentId: transaction.componentId,
      batchId,
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

const balanceInventory = (
  processor: InventoryBatchProcessor,
  current: (typeof schema.inventory.$inferSelect)[],
  target: (typeof schema.inventory.$inferSelect)[],
) => {
  const initial = current[0] ?? target[0];
  if (!initial) {
    return;
  }
  const componentId = initial.componentId;
  const batchId = initial.batchId;
  const locations = new Map<number, { target: Decimal; current: Decimal }>();

  for (const location of target) {
    locations.set(location.locationId, {
      target: new Decimal(location.totalQuantity),
      current: new Decimal(0),
    });
  }

  for (const location of current) {
    const entry = locations.get(location.locationId) ?? {
      target: new Decimal(0),
      current: new Decimal(0),
    };
    entry.current = entry.current.plus(location.totalQuantity);
    locations.set(location.locationId, entry);
  }

  for (const [locationId, amounts] of locations) {
    if (amounts.current.gt(amounts.target)) {
      let excess = amounts.current.minus(amounts.target);

      // Find locations that need more inventory
      for (const [putLocationId, putAmounts] of locations) {
        if (putLocationId === locationId) continue;

        const shortage = putAmounts.target.minus(putAmounts.current);
        if (shortage.lte(0)) continue;

        const moveQuantity = Decimal.min(excess, shortage);
        if (moveQuantity.gt(0)) {
          // Calculate and process the transfer
          const entry = processor.calculateOutboundEntry(
            { componentId, batchId },
            locationId,
            moveQuantity,
          );

          processor.updateInventory(entry, "outbound");
          processor.logToLedger("outbound", entry, {
            type: "transfer",
            userId: USER_ID,
            date: new Date(),
          });

          entry.locationId = putLocationId;
          processor.updateInventory(entry, "inbound");
          processor.logToLedger("inbound", entry, {
            type: "transfer",
            userId: USER_ID,
            date: new Date(),
          });

          // Update our tracking
          excess = excess.minus(moveQuantity);
          amounts.current = amounts.current.minus(moveQuantity);
          putAmounts.current = putAmounts.current.plus(moveQuantity);

          if (amounts.current.eq(amounts.target)) break;
        }
      }
    }
  }

  // for (const [locationId, amounts] of locations) {
  //   if (amounts.current.lt(amounts.target)) {
  //     const entry = processor.createInboundEntry(
  //       { componentId, batchId },
  //       locationId,
  //       amounts.target.minus(amounts.current),
  //       new Date(),
  //       new Date(),
  //       new Date(),
  //     );

  //     processor.updateInventory(entry, "inbound");
  //     processor.logToLedger("inbound", entry, {
  //       type: "correction",
  //       userId: USER_ID,
  //       date: new Date(),
  //     });
  //   } else if (amounts.current.gt(amounts.target)) {
  //     const entry = processor.calculateOutboundEntry(
  //       { componentId, batchId },
  //       locationId,
  //       amounts.current.minus(amounts.target),
  //     );

  //     processor.updateInventory(entry, "outbound");
  //     processor.logToLedger("outbound", entry, {
  //       type: "correction",
  //       userId: USER_ID,
  //       date: new Date(),
  //     });
  //   }
  // }
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

  // await db
  //   .update(schema.component)
  //   .set({
  //     isBatchTracked: true,
  //   })
  //   .where(
  //     inArray(
  //       schema.component.id,
  //       currentInventory
  //         .filter((i) => i.batchTracked)
  //         .map((i) => i.componentId),
  //     ),
  //   );

  const processor = new InventoryBatchProcessor();

  console.log("Getting transactions");

  const targetInventory = await getCurrentInventory();

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
          handleProductionTransaction(transaction, processor, targetInventory);
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

  console.log("Getting components");

  const components = await db
    .select({
      id: schema.component.id,
      isBatchTracked: schema.component.isBatchTracked,
      isStockTracked: schema.component.isStockTracked,
    })
    .from(schema.component);

  console.log("Getting target inventory");

  const currentInventory = processor.inventories.getAllInventories();

  console.log("Balancing inventory");

  // Balance each component's inventory
  for (const component of components) {
    if (!component.isStockTracked) {
      continue;
    }
    if (component.isBatchTracked) {
      const batches = targetInventory
        .filter((i) => i.componentId === component.id)
        .flatMap((i) => i.items)
        .reduce(
          (acc, item) => {
            const batchReference = item.batchReference ?? "undefined";

            if (!acc[batchReference]) {
              acc[batchReference] = [];
            }

            acc[batchReference].push({
              locationId: item.locationId,
              quantity: item.quantity,
            });

            return acc;
          },
          {} as Record<string, { locationId: number; quantity: Decimal }[]>,
        );

      for (const batchReference in batches) {
        const batch = processor.batches.getBatch(component.id, batchReference);

        const targetBatches =
          batches[batchReference]?.map((item) => {
            return {
              id: 0,
              componentId: component.id,
              batchId: batch?.id ?? null,
              locationId: item.locationId,
              totalQuantity: item.quantity,
              allocatedQuantity: new Decimal(0),
              freeQuantity: item.quantity,
              entryDate: new Date(),
              createdAt: new Date(),
              lastModified: new Date(),
            };
          }) ?? [];

        balanceInventory(
          processor,
          currentInventory.filter(
            (i) => i.componentId === component.id && i.batchId === batch?.id,
          ),
          targetBatches,
        );
      }
    }
    balanceInventory(
      processor,
      currentInventory.filter((i) => i.componentId === component.id),
      targetInventory
        .filter((i) => i.componentId === component.id)
        .flatMap((item) => {
          return item.items.map((i) => {
            return {
              id: 0,
              componentId: component.id,
              batchId: null,
              locationId: i.locationId,
              totalQuantity: i.quantity,
              allocatedQuantity: new Decimal(0),
              freeQuantity: i.quantity,
              entryDate: new Date(),
              createdAt: new Date(),
              lastModified: new Date(),
            };
          });
        }),
    );
  }
  // console.log("Testing inventory");

  // const testCurrent = processor.inventories.getAllInventories();

  // for (const component of components) {
  //   if (!component.isStockTracked) {
  //     continue;
  //   }
  //   const testItem = testCurrent
  //     .filter((i) => i.componentId === component.id)
  //     .reduce((acc, item) => {
  //       return acc.plus(item.totalQuantity);
  //     }, new Decimal(0));

  //   const testTarget = targetInventory
  //     .filter((i) => i.componentId === component.id)
  //     .reduce((acc, item) => {
  //       return acc.plus(item.totalQuantity);
  //     }, new Decimal(0));

  //   if (!testItem.eq(testTarget)) {
  //     console.log(component.id, testItem, testTarget);
  //   }
  // }

  try {
    await processor.saveAll();
  } catch (error) {
    console.error("Error saving inventory", error);
    throw error;
  }
};
