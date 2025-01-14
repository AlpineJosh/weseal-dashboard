import Decimal from "decimal.js";

import { schema } from "@repo/db";

import { db } from "../../../db";

type BatchMovement = typeof schema.base.batchMovement.$inferInsert;

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

  public movements: (typeof schema.base.batchMovement.$inferInsert)[] = [];

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

    const sortedBatches = this.batches
      .sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime())
      .filter((batch) => batch.remainingQuantity.gt(0)); // Only consider batches with positive quantity

    if (sortedBatches.length === 0) {
      const movement = await this.createBatch(transaction);
      movements.push(movement);
    } else {
      for (const batch of sortedBatches) {
        if (remainingQuantity.isZero()) break;

        const qtyToUse = Decimal.min(
          batch.remainingQuantity,
          remainingQuantity,
        );

        if (qtyToUse.isZero()) continue;

        batch.remainingQuantity = batch.remainingQuantity.minus(qtyToUse);

        remainingQuantity = remainingQuantity.minus(qtyToUse);

        movements.push({
          batchId: batch.id,
          quantity: qtyToUse.negated(),
          date: transaction.date,
          locationId: this.defaultLocationId,
          type: transaction.type,
        });
      }

      if (remainingQuantity.gt(0)) {
        // If we still have quantity to allocate, create a new batch or use oldest batch
        const batch = sortedBatches[0];

        if (!batch) {
          const movement = await this.createBatch({
            ...transaction,
            quantity: remainingQuantity.negated(),
          });
          movements.push(movement);
        } else {
          batch.remainingQuantity =
            batch.remainingQuantity.minus(remainingQuantity);

          movements.push({
            batchId: batch.id,
            quantity: remainingQuantity.negated(),
            date: transaction.date,
            locationId: this.defaultLocationId,
            type: transaction.type,
          });
        }
      }
    }

    return movements;
  }

  private async createBatch(transaction: Transaction): Promise<BatchMovement> {
    const batches = await db
      .insert(schema.base.batch)
      .values({
        componentId: transaction.component_id,
        entryDate: transaction.date,
        createdAt: transaction.created_at,
        lastModified: transaction.last_modified,
      })
      .returning({ id: schema.base.batch.id });

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
      quantity: transaction.quantity,
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
          quantity: new Decimal(qtyToAdd),
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
          quantity: new Decimal(remainingQuantity),
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

    const trans = this.transactions.sort((a, b) => {
      const dateComparison = a.date.getTime() - b.date.getTime();
      if (dateComparison !== 0) return dateComparison;
      return b.quantity.minus(a.quantity).toNumber();
    });

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
      .insert(schema.base.purchaseReceiptItem)
      .values({
        receiptId,
        batchId: movement.batchId,
        quantity: transaction.quantity,
      })
      .returning({ id: schema.base.purchaseReceiptItem.id });

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
      .insert(schema.base.productionBatchOutput)
      .values({
        jobId: productionJobId,
        batchId: movement.batchId,
        productionQuantity: transaction.quantity,
        productionDate: transaction.date,
      })
      .returning({ id: schema.base.productionBatchOutput.id });

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
      .insert(schema.base.salesDespatchItem)
      .values(
        movements.map((m) => ({
          batchId: m.batchId,
          quantity: m.quantity,
          despatchId,
        })),
      )
      .returning({
        id: schema.base.salesDespatchItem.id,
        batchId: schema.base.salesDespatchItem.batchId,
        quantity: schema.base.salesDespatchItem.quantity,
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
            quantity: new Decimal(item.quantity),
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
      .insert(schema.base.productionBatchInput)
      .values(
        movements.map((m) => ({
          jobId,
          batchId: m.batchId,
          quantityUsed: m.quantity.negated(),
          quantityAllocated: new Decimal(0),
          locationId: this.defaultLocationId,
        })),
      )
      .returning({
        id: schema.base.productionBatchInput.id,
        batchId: schema.base.productionBatchInput.batchId,
        quantityUsed: schema.base.productionBatchInput.quantityUsed,
      });

    this.movements.push(
      ...productionInputs.map(
        (item) =>
          ({
            batchId: item.batchId,
            quantity: item.quantityUsed.negated(),
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
    const batchTotalQuantities = new Map<number, Decimal>();

    // Initialize batch quantities
    for (const batch of sortedBatches) {
      batchTotalQuantities.set(batch.id, new Decimal(0));
    }

    // Calculate current quantities from existing movements
    for (const movement of this.movements) {
      // Update location quantities
      const locationMap =
        currentBatchLocations.get(movement.batchId) ??
        new Map<number, Decimal>();
      const currentQty = locationMap.get(movement.locationId) ?? new Decimal(0);
      locationMap.set(movement.locationId, currentQty.plus(movement.quantity));
      currentBatchLocations.set(movement.batchId, locationMap);

      // Update total quantities
      const totalQty =
        batchTotalQuantities.get(movement.batchId) ?? new Decimal(0);
      batchTotalQuantities.set(
        movement.batchId,
        totalQty.plus(movement.quantity),
      );
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
      const desiredTotalsByLocation = new Map<number, Decimal>();

      // Calculate desired totals per location
      for (const item of this.bitSystemsItems) {
        const currentQty =
          desiredTotalsByLocation.get(item.locationId) ?? new Decimal(0);
        desiredTotalsByLocation.set(
          item.locationId,
          currentQty.plus(item.quantity),
        );
      }

      // Filter and sort available batches
      const availableBatches = sortedBatches
        .filter((batch) => {
          const totalQty = batchTotalQuantities.get(batch.id) ?? new Decimal(0);
          return batch.remainingQuantity.minus(totalQty).gt(0);
        })
        .sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime());

      // Balance each location using available batches
      for (const [locationId, desiredQty] of desiredTotalsByLocation) {
        if (locationId === this.defaultLocationId) continue;

        const currentQty = Array.from(currentBatchLocations.values()).reduce(
          (sum, locations) =>
            sum.plus(locations.get(locationId) ?? new Decimal(0)),
          new Decimal(0),
        );

        const difference = desiredQty.minus(currentQty);

        if (!difference.isZero()) {
          let remainingDifference = difference;

          for (const batch of availableBatches) {
            if (remainingDifference.isZero()) break;

            const batchLocations =
              currentBatchLocations.get(batch.id) ?? new Map<number, Decimal>();
            const batchLocationQty =
              batchLocations.get(locationId) ?? new Decimal(0);
            const totalBatchQty =
              batchTotalQuantities.get(batch.id) ?? new Decimal(0);

            // Calculate available quantity considering both remaining and current quantities
            const availableQty = batch.remainingQuantity.minus(totalBatchQty);

            if (availableQty.lte(0)) continue;

            // Calculate how much we can move
            const qtyToMove = Decimal.min(
              remainingDifference.abs(),
              availableQty,
            );

            if (qtyToMove.isZero()) continue;

            const quantity = remainingDifference.gt(0)
              ? qtyToMove
              : qtyToMove.negated();

            this.movements.push({
              batchId: batch.id,
              quantity: new Decimal(quantity),
              date: today,
              locationId,
              type: "correction",
            });

            // Update tracking maps
            batchLocations.set(locationId, batchLocationQty.plus(quantity));
            currentBatchLocations.set(batch.id, batchLocations);

            batchTotalQuantities.set(batch.id, totalBatchQty.plus(quantity));

            remainingDifference = remainingDifference.minus(
              remainingDifference.gt(0) ? qtyToMove : qtyToMove.negated(),
            );
          }

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
                quantity: qty.negated(),
                date: today,
                locationId,
                type: "correction",
              },
              {
                batchId,
                quantity: new Decimal(qty),
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
                quantity: difference.negated(),
                date: today,
                locationId: this.defaultLocationId,
                type: "correction",
              },
              {
                batchId,
                quantity: new Decimal(difference),
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
                quantity: new Decimal(difference),
                date: today,
                locationId,
                type: "correction",
              },
              {
                batchId,
                quantity: difference.negated(),
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
              quantity: desiredQty.negated(),
              date: today,
              locationId: this.defaultLocationId,
              type: "correction",
            },
            {
              batchId,
              quantity: new Decimal(desiredQty),
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
