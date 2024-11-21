import { Decimal } from "decimal.js";

import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

type BatchMovement = typeof schema.batchMovement.$inferInsert;

export interface Transaction {
  id: number;
  component_id: string;
  quantity: Decimal;
  reference: string | null;
  date: Date;
  reference_numeric: number | null;
  details: string | null;
  type: "correction" | "production" | "receipt" | "despatch";
  created_at: Date;
  last_modified: Date;
}

interface Grn {
  orderId: number;
  quantity: Decimal;
  date: Date;
}

interface Gdn {
  orderId: number;
  quantity: Decimal;
  date: Date;
}

interface BitSystemsBatch {
  id: number;
  reference: string;
  date: Date;
}

interface BitSystemsItem {
  id: number;
  locationId: number;
  quantity: Decimal;
}

interface BitSystemsTraceableItem {
  id: number;
  itemId: number;
  batchId: number;
  quantity: Decimal;
}

export interface ResetData {
  getPurchaseReceiptId(orderId: number, receiptDate: Date): Promise<number>;
  getSalesDespatchId(orderId: number, despatchDate: Date): Promise<number>;
  getProductionJobId(
    componentId: string,
    date: Date,
    reference?: string,
  ): Promise<number | undefined>;
}

export class ResetComponent {
  private transactions: Transaction[] = [];
  private defaultLocationId = 1;

  private batches: {
    id: number;
    remainingQuantity: Decimal;
    entryDate: Date;
    reference?: string;
  }[] = [];

  private gdns: Gdn[] = [];

  private grns: Grn[] = [];

  private bitSystemsBatches: BitSystemsBatch[] = [];

  private bitSystemsItems: BitSystemsItem[] = [];

  private bitSystemsTraceableItems: BitSystemsTraceableItem[] = [];

  public movements: (typeof schema.batchMovement.$inferInsert)[] = [];

  constructor(
    public id: string,
    private resetData: ResetData,
  ) {}

  addTransaction(transaction: Transaction) {
    this.transactions.push(transaction);
  }

  addGrn(grn: Grn) {
    this.grns.push(grn);
  }

  addGdn(gdn: Gdn) {
    this.gdns.push(gdn);
  }

  addBitSystemsBatch(bitSystemsBatch: BitSystemsBatch) {
    this.bitSystemsBatches.push(bitSystemsBatch);
  }

  addBitSystemsItem(item: BitSystemsItem) {
    this.defaultLocationId = item.locationId;

    this.bitSystemsItems.push(item);
  }

  addBitSystemsTraceableItem(item: BitSystemsTraceableItem) {
    this.bitSystemsTraceableItems.push(item);
  }

  private async allocateBatches(
    transaction: Transaction,
  ): Promise<BatchMovement[]> {
    const movements: BatchMovement[] = [];

    let remainingQuantity = new Decimal(transaction.quantity).negated();

    const sortedBatches = this.batches.sort(
      (a, b) => a.entryDate.getTime() - b.entryDate.getTime(),
    );
    if (sortedBatches.length === 0) {
      const movement = await this.createBatch(transaction);
      movements.push(movement);
    } else {
      for (const batch of sortedBatches) {
        if (remainingQuantity.lte(0)) break;

        if (batch.remainingQuantity.lte(0)) continue;

        const qtyToUse = Decimal.min(
          batch.remainingQuantity,
          remainingQuantity,
        );
        batch.remainingQuantity = batch.remainingQuantity.minus(qtyToUse);
        remainingQuantity = remainingQuantity.minus(qtyToUse);

        if (qtyToUse.equals(0)) continue;

        movements.push({
          batchId: batch.id,
          quantity: qtyToUse.negated().toNumber(),
          date: transaction.date,
          locationId: this.defaultLocationId,
          type: transaction.type,
        });
      }

      if (remainingQuantity.gt(0)) {
        const batch = sortedBatches[0];

        if (!batch) {
          console.error("No batch found to allocate to.");
          throw new Error("No batch found to allocate to.");
        }

        batch.remainingQuantity =
          batch.remainingQuantity.minus(remainingQuantity);

        movements.push({
          batchId: batch.id,
          quantity: remainingQuantity.negated().toNumber(),
          date: transaction.date,
          locationId: this.defaultLocationId,
          type: transaction.type,
        });
      }
    }

    return movements;
  }

  private async createBatch(transaction: Transaction): Promise<BatchMovement> {
    const batches = await db
      .insert(schema.batch)
      .values({
        componentId: transaction.component_id,
        entryDate: transaction.date,
        createdAt: transaction.created_at,
        lastModified: transaction.last_modified,
      })
      .returning({ id: schema.batch.id });

    const batch = batches[0];

    if (!batch) {
      console.error("Failed to create batch.");
      throw new Error("Failed to create batch.");
    }

    this.batches.push({
      id: batch.id,
      remainingQuantity: new Decimal(transaction.quantity),
      entryDate: transaction.date,
    });

    const movement = {
      batchId: batch.id,
      quantity: transaction.quantity.toNumber(),
      date: transaction.date,
      locationId: this.defaultLocationId,
      type: transaction.type,
    };

    return movement;
  }

  private async inferBatches(
    transaction: Transaction,
  ): Promise<BatchMovement[]> {
    const movements: BatchMovement[] = [];

    let remainingQuantity = new Decimal(transaction.quantity);

    const sortedBatches = this.batches.sort(
      (a, b) => a.entryDate.getTime() - b.entryDate.getTime(),
    );

    if (sortedBatches.length === 0) {
      const movement = await this.createBatch(transaction);
      movements.push(movement);
    } else {
      for (const batch of sortedBatches) {
        if (remainingQuantity.lte(0)) break;

        if (batch.remainingQuantity.gte(0)) continue;

        const qtyToAdd = Decimal.min(
          batch.remainingQuantity.negated(),
          remainingQuantity,
        );
        batch.remainingQuantity = batch.remainingQuantity.plus(qtyToAdd);
        remainingQuantity = remainingQuantity.minus(qtyToAdd);

        if (qtyToAdd.equals(0)) continue;

        movements.push({
          batchId: batch.id,
          quantity: qtyToAdd.toNumber(),
          date: transaction.date,
          locationId: this.defaultLocationId,
          type: transaction.type,
        });
      }

      if (remainingQuantity.gt(0)) {
        const batch = sortedBatches[sortedBatches.length - 1];

        if (!batch) {
          console.error("No batch found to allocate to.");
          throw new Error("No batch found to allocate to.");
        }

        batch.remainingQuantity =
          batch.remainingQuantity.plus(remainingQuantity);

        movements.push({
          batchId: batch.id,
          quantity: remainingQuantity.toNumber(),
          date: transaction.date,
          locationId: this.defaultLocationId,
          type: transaction.type,
        });
      }
    }

    return movements;
  }

  private async getPurchaseReceiptId(
    transaction: Transaction,
  ): Promise<number | undefined> {
    const sortedGrns = this.grns
      .sort(
        (a, b) =>
          Math.abs(a.date.getTime() - transaction.date.getTime()) -
          Math.abs(b.date.getTime() - transaction.date.getTime()),
      )
      .filter(
        (grn) =>
          Math.abs(grn.date.getTime() - transaction.date.getTime()) <
          1000 * 60 * 60 * 24 * 5,
      );

    const grn = sortedGrns[0];

    if (grn) {
      return this.resetData.getPurchaseReceiptId(grn.orderId, grn.date);
    }
  }

  private async getSalesDespatchId(
    transaction: Transaction,
  ): Promise<number | undefined> {
    const sortedGdns = this.gdns
      .sort(
        (a, b) =>
          Math.abs(a.date.getTime() - transaction.date.getTime()) -
          Math.abs(b.date.getTime() - transaction.date.getTime()),
      )
      .filter(
        (grn) =>
          Math.abs(grn.date.getTime() - transaction.date.getTime()) <
          1000 * 60 * 60 * 24 * 5,
      );

    const gdn = sortedGdns[0];

    if (gdn) {
      return this.resetData.getSalesDespatchId(gdn.orderId, gdn.date);
    }
  }

  /**
   * Processes all transactions in order to maintain FIFO batch management.
   */
  async process() {
    console.log(`Processing component ${this.id}`);

    for (const transaction of this.transactions) {
      if (transaction.quantity.gt(0)) {
        switch (transaction.type) {
          case "receipt":
            await this.handleReceiptTransaction(transaction);
            break;
          case "production":
            await this.handleProductionInTransaction(transaction);
            break;
          case "correction":
            await this.handleCorrectionInTransaction(transaction);
            break;
        }
      } else {
        switch (transaction.type) {
          case "despatch":
            await this.handleDespatchTransaction(transaction);
            break;
          case "production":
            await this.handleProductionOutTransaction(transaction);
            break;
          case "correction":
            await this.handleCorrectionOutTransaction(transaction);
            break;
        }
      }
    }

    this.balanceLocations();
  }

  private async handleReceiptTransaction(transaction: Transaction) {
    const receiptId = await this.getPurchaseReceiptId(transaction);

    if (!receiptId) {
      return this.handleCorrectionInTransaction(transaction);
    }

    const movement = await this.createBatch(transaction);

    const purchaseReceiptItem = await db
      .insert(schema.purchaseReceiptItem)
      .values({
        receiptId,
        batchId: movement.batchId,
        quantity: transaction.quantity.toNumber(),
      })
      .returning({ id: schema.purchaseReceiptItem.id });

    this.movements.push({
      ...movement,
      purchaseReceiptItemId: purchaseReceiptItem[0]?.id,
    });
  }

  private async handleProductionInTransaction(transaction: Transaction) {
    const productionJobId = await this.resetData.getProductionJobId(
      transaction.component_id,
      transaction.date,
      transaction.reference ?? undefined,
    );

    if (!productionJobId) {
      return this.handleCorrectionInTransaction(transaction);
    }

    const matchingBatches = this.bitSystemsBatches.filter((batch) => {
      return batch.date.getDate() === transaction.date.getDate();
    });

    if (matchingBatches.length > 0) {
      transaction.reference = matchingBatches[0]?.reference ?? null;
    }

    const movement = await this.createBatch(transaction);

    const productionJobItem = await db
      .insert(schema.productionBatchOutput)
      .values({
        jobId: productionJobId,
        batchId: movement.batchId,
        productionQuantity: transaction.quantity.toNumber(),
        productionDate: transaction.date,
      })
      .returning({ id: schema.productionBatchOutput.id });

    const productionBatchOutputId = productionJobItem[0]?.id;

    this.movements.push({
      ...movement,
      productionBatchOutputId,
    });
  }

  private async handleCorrectionInTransaction(transaction: Transaction) {
    const movements = await this.inferBatches(transaction);

    this.movements.push(...movements);
  }

  private async handleCorrectionOutTransaction(transaction: Transaction) {
    const movements = await this.allocateBatches(transaction);

    this.movements.push(...movements);
  }

  private async handleDespatchTransaction(transaction: Transaction) {
    const despatchId = await this.getSalesDespatchId(transaction);

    if (!despatchId) {
      return this.handleCorrectionOutTransaction(transaction);
    }

    const movements = await this.allocateBatches(transaction);

    const despatchItems = await db
      .insert(schema.salesDespatchItem)
      .values(
        movements.map((m) => ({
          batchId: m.batchId,
          quantity: m.quantity,
          despatchId,
        })),
      )
      .returning({
        id: schema.salesDespatchItem.id,
        batchId: schema.salesDespatchItem.batchId,
        quantity: schema.salesDespatchItem.quantity,
      });

    if (despatchItems.length === 0) {
      console.error("Failed to create despatch items.");
      return;
    }

    this.movements.push(
      ...despatchItems.map(
        (item) =>
          ({
            batchId: item.batchId,
            quantity: item.quantity,
            date: transaction.date,
            locationId: 1,
            type: "despatch",
            despatchItemId: item.id,
          }) as BatchMovement,
      ),
    );
  }

  private async handleProductionOutTransaction(transaction: Transaction) {
    const jobId = await this.resetData.getProductionJobId(
      transaction.details ?? "",
      transaction.date,
    );

    if (!jobId) {
      return this.handleCorrectionOutTransaction(transaction);
    }
    const movements = await this.allocateBatches(transaction);

    if (movements.length === 0) {
      return;
    }

    const productionInputs = await db
      .insert(schema.productionBatchInput)
      .values(
        movements.map((m) => ({
          jobId,
          batchId: m.batchId,
          quantityUsed: m.quantity,
          locationId: 1,
        })),
      )
      .returning({
        id: schema.productionBatchInput.id,
        batchId: schema.productionBatchInput.batchId,
        quantityUsed: schema.productionBatchInput.quantityUsed,
      });

    this.movements.push(
      ...productionInputs.map(
        (item) =>
          ({
            batchId: item.batchId,
            quantity: item.quantityUsed,
            date: transaction.date,
            locationId: this.defaultLocationId,
            type: "production",
            productionInputId: item.id,
          }) as BatchMovement,
      ),
    );
  }

  private balanceLocations() {
    // Calculate current batch quantities per location
    const currentBatchLocations = new Map<number, Map<number, Decimal>>();

    for (const movement of this.movements) {
      const locationMap =
        currentBatchLocations.get(movement.batchId) ??
        new Map<number, Decimal>();
      const currentQty = locationMap.get(movement.locationId) ?? new Decimal(0);
      locationMap.set(movement.locationId, currentQty.plus(movement.quantity));
      currentBatchLocations.set(movement.batchId, locationMap);
    }

    if (this.bitSystemsTraceableItems.length > 0) {
      // Handle traceable items case - specific batches to specific locations
      const desiredLocations = new Map<number, Map<number, Decimal>>();

      // Create a map of BitSystems batch references to our batch IDs
      const batchReferenceMap = new Map<string, number>();
      for (const batch of this.batches) {
        if (batch.reference) {
          const bitBatch = this.bitSystemsBatches.find(
            (b) => b.reference === batch.reference,
          );
          if (bitBatch) {
            batchReferenceMap.set(bitBatch.reference, batch.id);
          }
        }
      }

      // Map traceable items to our batches using the reference map
      for (const traceableItem of this.bitSystemsTraceableItems) {
        const bitBatch = this.bitSystemsBatches.find(
          (b) => b.id === traceableItem.batchId,
        );
        if (!bitBatch) continue;

        const batchId = batchReferenceMap.get(bitBatch.reference);
        if (!batchId) continue;

        const item = this.bitSystemsItems.find(
          (i) => i.id === traceableItem.itemId,
        );
        if (!item) continue;

        const locationMap =
          desiredLocations.get(batchId) ?? new Map<number, Decimal>();
        const currentQty = locationMap.get(item.locationId) ?? new Decimal(0);
        locationMap.set(
          item.locationId,
          currentQty.plus(traceableItem.quantity),
        );
        desiredLocations.set(batchId, locationMap);
      }

      this.createBalancingMovements(currentBatchLocations, desiredLocations);
    } else {
      // Handle non-traceable case - total quantities per location matter
      const desiredTotalsByLocation = new Map<number, Decimal>();

      // Sum up desired quantities per location from BitSystems items
      for (const item of this.bitSystemsItems) {
        const currentQty =
          desiredTotalsByLocation.get(item.locationId) ?? new Decimal(0);
        desiredTotalsByLocation.set(
          item.locationId,
          currentQty.plus(item.quantity),
        );
      }

      // Calculate current totals per location
      const currentTotalsByLocation = new Map<number, Decimal>();
      for (const [_, locationMap] of currentBatchLocations) {
        for (const [locationId, qty] of locationMap) {
          const currentTotal =
            currentTotalsByLocation.get(locationId) ?? new Decimal(0);
          currentTotalsByLocation.set(locationId, currentTotal.plus(qty));
        }
      }

      // Create movements to balance locations using the oldest batch
      const sortedBatches = Array.from(currentBatchLocations.keys()).sort(
        (a, b) => a - b,
      );
      const primaryBatchId = sortedBatches[0];

      if (!primaryBatchId) return;

      const today = new Date();

      // Balance each location
      for (const [locationId, desiredQty] of desiredTotalsByLocation) {
        const currentQty =
          currentTotalsByLocation.get(locationId) ?? new Decimal(0);
        const difference = desiredQty.minus(currentQty);

        if (!difference.equals(0)) {
          this.movements.push({
            batchId: primaryBatchId,
            quantity: difference.toNumber(),
            date: today,
            locationId,
            type: "correction",
          });
        }
      }
    }
  }

  private createBalancingMovements(
    currentBatchLocations: Map<number, Map<number, Decimal>>,
    desiredLocations: Map<number, Map<number, Decimal>>,
  ) {
    const today = new Date();

    // Calculate total available quantity across all batches
    let totalAvailable = new Decimal(0);
    for (const [_, locations] of currentBatchLocations) {
      for (const qty of locations.values()) {
        totalAvailable = totalAvailable.plus(qty);
      }
    }

    // Sort batches by date for FIFO
    const batchesInFifoOrder = Array.from(currentBatchLocations.entries()).sort(
      (a, b) => {
        const batchA = this.batches.find((batch) => batch.id === a[0]);
        const batchB = this.batches.find((batch) => batch.id === b[0]);
        return (
          (batchA?.entryDate.getTime() ?? 0) -
          (batchB?.entryDate.getTime() ?? 0)
        );
      },
    );

    for (const [batchId, currentLocations] of batchesInFifoOrder) {
      const desiredForBatch = desiredLocations.get(batchId);
      if (!desiredForBatch) continue;

      for (const [locationId, currentQty] of currentLocations) {
        const desiredQty = desiredForBatch.get(locationId) ?? new Decimal(0);
        const difference = desiredQty.minus(currentQty);

        if (!difference.equals(0)) {
          // Validate the movement won't create negative stock
          const batchTotal = Array.from(currentLocations.values()).reduce(
            (sum, qty) => sum.plus(qty),
            new Decimal(0),
          );

          if (batchTotal.plus(difference).lt(0)) {
            console.warn(
              `Skipping invalid movement that would create negative stock for batch ${batchId}`,
            );
            continue;
          }

          this.movements.push({
            batchId,
            quantity: difference.toNumber(),
            date: today,
            locationId,
            type: "correction",
          });
        }
      }

      // Add movements for locations that don't exist yet
      for (const [locationId, desiredQty] of desiredForBatch) {
        if (!currentLocations.has(locationId)) {
          this.movements.push({
            batchId,
            quantity: desiredQty.toNumber(),
            date: today,
            locationId,
            type: "correction",
          });
        }
      }
    }
  }
}
