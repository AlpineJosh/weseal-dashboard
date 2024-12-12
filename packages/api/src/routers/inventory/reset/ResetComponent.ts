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
        if (remainingQuantity.isZero()) break;

        if (batch.remainingQuantity.lte(0)) continue;

        let qtyToUse = new Decimal(0);

        if (batch.remainingQuantity.lte(remainingQuantity)) {
          qtyToUse = batch.remainingQuantity;
          batch.remainingQuantity = new Decimal(0);
          remainingQuantity = remainingQuantity.minus(qtyToUse);
        } else {
          qtyToUse = remainingQuantity;
          batch.remainingQuantity = batch.remainingQuantity.minus(qtyToUse);
          remainingQuantity = new Decimal(0);
        }

        if (qtyToUse.isZero()) continue;

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
        if (remainingQuantity.isZero()) break;

        if (batch.remainingQuantity.gte(0)) continue;

        const qtyToAdd = Decimal.min(
          batch.remainingQuantity.negated(),
          remainingQuantity,
        );

        if (qtyToAdd.isZero()) continue;

        batch.remainingQuantity = batch.remainingQuantity.plus(qtyToAdd);
        remainingQuantity = remainingQuantity.minus(qtyToAdd);

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

    const trans = this.transactions.sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    for (const transaction of trans) {
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

    // const logFile = fs.createWriteStream(`reset-component-${this.id}.log`);

    // logFile.write("Batches:\n");
    // logFile.write(
    //   JSON.stringify(
    //     this.batches.filter((b) => !b.remainingQuantity.eq(0)),
    //     null,
    //     2,
    //   ),
    // );
    // logFile.write("\n");

    // logFile.write("BitSystems Batches:\n");
    // logFile.write(JSON.stringify(this.bitSystemsBatches, null, 2));

    // logFile.write("\n");

    // logFile.write("BitSystems Items:\n");
    // logFile.write(JSON.stringify(this.bitSystemsItems, null, 2));

    // logFile.write("\n");

    // logFile.write("BitSystems Traceable Items:\n");

    // logFile.write(JSON.stringify(this.bitSystemsTraceableItems, null, 2));

    // logFile.write("\n");

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
            locationId: this.defaultLocationId,
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
          quantityUsed: -m.quantity,
          quantityAllocated: 0,
          locationId: this.defaultLocationId,
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
            quantity: -item.quantityUsed,
            date: transaction.date,
            locationId: this.defaultLocationId,
            type: "production",
            productionInputId: item.id,
          }) as BatchMovement,
      ),
    );
  }

  private balanceLocations() {
    const today = new Date();

    // Sort batches by date (FIFO)
    const sortedBatches = [...this.batches].sort(
      (a, b) => a.entryDate.getTime() - b.entryDate.getTime(),
    );

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
      // Handle non-traceable case
      const desiredTotalsByLocation = new Map<number, Decimal>();
      const currentTotalsByLocation = new Map<number, Decimal>();

      // Calculate desired totals per location
      for (const item of this.bitSystemsItems) {
        const currentQty =
          desiredTotalsByLocation.get(item.locationId) ?? new Decimal(0);
        desiredTotalsByLocation.set(
          item.locationId,
          currentQty.plus(item.quantity),
        );
      }

      // Calculate current totals per location
      for (const movement of this.movements) {
        const currentQty =
          currentTotalsByLocation.get(movement.locationId) ?? new Decimal(0);
        currentTotalsByLocation.set(
          movement.locationId,
          currentQty.plus(movement.quantity),
        );
      }

      // Balance each location - use sortedBatches instead of this.batches
      for (const [locationId, desiredQty] of desiredTotalsByLocation) {
        const currentQty =
          currentTotalsByLocation.get(locationId) ?? new Decimal(0);
        const difference = desiredQty.minus(currentQty);

        if (!difference.isZero()) {
          let remainingDifference = difference;

          for (const batch of sortedBatches) {
            if (remainingDifference.isZero()) break;

            // Need to check batch's available quantity
            const batchCurrentLocations =
              currentBatchLocations.get(batch.id) ?? new Map<number, Decimal>();
            const batchTotalQty = Array.from(
              batchCurrentLocations.values(),
            ).reduce((sum, qty) => sum.plus(qty), new Decimal(0));

            // Calculate how much we can move from this batch
            const qtyToMove = Decimal.min(
              remainingDifference.abs(),
              difference.gt(0) ? batch.remainingQuantity : batchTotalQty,
            );

            if (qtyToMove.isZero()) continue;

            // Create dual-entry movements
            if (difference.gt(0)) {
              // Moving stock in from system
              this.movements.push(
                {
                  batchId: batch.id,
                  quantity: -qtyToMove.toNumber(),
                  date: today,
                  locationId: this.defaultLocationId,
                  type: "correction",
                },
                {
                  batchId: batch.id,
                  quantity: qtyToMove.toNumber(),
                  date: today,
                  locationId,
                  type: "correction",
                },
              );
            } else {
              // Moving stock out to system
              this.movements.push(
                {
                  batchId: batch.id,
                  quantity: -qtyToMove.toNumber(),
                  date: today,
                  locationId,
                  type: "correction",
                },
                {
                  batchId: batch.id,
                  quantity: qtyToMove.toNumber(),
                  date: today,
                  locationId: this.defaultLocationId,
                  type: "correction",
                },
              );
            }

            remainingDifference = remainingDifference.minus(qtyToMove);
          }

          // Add warning if we couldn't balance completely
          if (!remainingDifference.isZero()) {
            console.warn(
              `Unable to fully balance location ${locationId}. Remaining difference: ${remainingDifference.toString()}`,
            );
          }
        }
      }
    }
  }

  private createBalancingMovements(
    currentBatchLocations: Map<number, Map<number, Decimal>>,
    desiredLocations: Map<number, Map<number, Decimal>>,
  ) {
    const today = new Date();

    // Validate total quantities
    const totalCurrent = Array.from(currentBatchLocations.values()).reduce(
      (sum, locations) =>
        sum.plus(
          Array.from(locations.values()).reduce(
            (locSum, qty) => locSum.plus(qty),
            new Decimal(0),
          ),
        ),
      new Decimal(0),
    );

    const totalDesired = Array.from(desiredLocations.values()).reduce(
      (sum, locations) =>
        sum.plus(
          Array.from(locations.values()).reduce(
            (locSum, qty) => locSum.plus(qty),
            new Decimal(0),
          ),
        ),
      new Decimal(0),
    );

    if (!totalCurrent.equals(totalDesired)) {
      console.warn(
        `Total quantity mismatch: Current ${totalCurrent.toString()} vs Desired ${totalDesired.toString()}`,
      );
    }

    // Process each batch's movements
    for (const [batchId, currentLocations] of currentBatchLocations) {
      const desiredForBatch = desiredLocations.get(batchId);

      // Find the batch object to get its remaining quantity
      const batch = this.batches.find((b) => b.id === batchId);
      if (!batch) {
        console.warn(`Batch ${batchId} not found in batches array`);
        continue;
      }

      if (!desiredForBatch) {
        // Zero out any remaining quantities
        for (const [locationId, qty] of currentLocations) {
          if (!qty.isZero()) {
            this.movements.push(
              {
                batchId,
                quantity: -qty.toNumber(),
                date: today,
                locationId,
                type: "correction",
              },
              {
                batchId,
                quantity: qty.toNumber(),
                date: today,
                locationId: this.defaultLocationId,
                type: "correction",
              },
            );
          }
        }
        continue;
      }

      // Validate that desired quantities don't exceed batch total
      const desiredTotal = Array.from(desiredForBatch.values()).reduce(
        (sum, qty) => sum.plus(qty),
        new Decimal(0),
      );

      if (desiredTotal.gt(batch.remainingQuantity)) {
        console.warn(
          `Desired quantity ${desiredTotal.toString()} exceeds batch ${batchId} remaining quantity ${batch.remainingQuantity.toString()}`,
        );
        continue;
      }

      // Balance existing locations
      for (const [locationId, currentQty] of currentLocations) {
        const desiredQty = desiredForBatch.get(locationId) ?? new Decimal(0);
        const difference = desiredQty.minus(currentQty);

        if (!difference.isZero()) {
          if (difference.gt(0)) {
            // Moving stock in
            this.movements.push(
              {
                batchId,
                quantity: -difference.toNumber(),
                date: today,
                locationId: this.defaultLocationId,
                type: "correction",
              },
              {
                batchId,
                quantity: difference.toNumber(),
                date: today,
                locationId,
                type: "correction",
              },
            );
          } else {
            // Moving stock out
            this.movements.push(
              {
                batchId,
                quantity: difference.toNumber(),
                date: today,
                locationId,
                type: "correction",
              },
              {
                batchId,
                quantity: -difference.toNumber(),
                date: today,
                locationId: this.defaultLocationId,
                type: "correction",
              },
            );
          }
        }
      }

      // Handle new locations
      for (const [locationId, desiredQty] of desiredForBatch) {
        if (!currentLocations.has(locationId) && !desiredQty.isZero()) {
          this.movements.push(
            {
              batchId,
              quantity: -desiredQty.toNumber(),
              date: today,
              locationId: this.defaultLocationId,
              type: "correction",
            },
            {
              batchId,
              quantity: desiredQty.toNumber(),
              date: today,
              locationId,
              type: "correction",
            },
          );
        }
      }
    }
  }
}
