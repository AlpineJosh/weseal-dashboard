import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

type BatchMovement = typeof schema.batchMovement.$inferInsert;

export interface Transaction {
  id: number;
  component_id: string;
  quantity: number;
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
  quantity: number;
  date: Date;
}

interface Gdn {
  orderId: number;
  quantity: number;
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
  quantity: number;
}

interface BitSystemsTraceableItem {
  id: number;
  itemId: number;
  batchId: number;
  quantity: number;
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
    remainingQuantity: number;
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

    let remainingQuantity = Number((-transaction.quantity).toFixed(6));

    const sortedBatches = this.batches.sort(
      (a, b) => a.entryDate.getTime() - b.entryDate.getTime(),
    );
    if (sortedBatches.length === 0) {
      const movement = await this.createBatch(transaction);
      movements.push(movement);
    } else {
      for (const batch of sortedBatches) {
        if (remainingQuantity <= 0) break;

        if (batch.remainingQuantity <= 0) continue;

        const qtyToUse = Number(
          Math.min(batch.remainingQuantity, remainingQuantity).toFixed(6),
        );
        batch.remainingQuantity = Number(
          (batch.remainingQuantity - qtyToUse).toFixed(6),
        );
        remainingQuantity = Number((remainingQuantity - qtyToUse).toFixed(6));

        movements.push({
          batchId: batch.id,
          quantity: -qtyToUse,
          date: transaction.date,
          locationId: this.defaultLocationId,
          type: transaction.type,
        });
      }

      if (remainingQuantity > 0) {
        const batch = sortedBatches[0];

        if (!batch) {
          console.error("No batch found to allocate to.");
          throw new Error("No batch found to allocate to.");
        }

        batch.remainingQuantity -= remainingQuantity;

        movements.push({
          batchId: batch.id,
          quantity: -remainingQuantity,
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
      remainingQuantity: transaction.quantity,
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

    const sortedBatches = this.batches.sort(
      (a, b) => a.entryDate.getTime() - b.entryDate.getTime(),
    );

    let remainingQuantity = Number(transaction.quantity.toFixed(6));

    if (sortedBatches.length === 0) {
      const movement = await this.createBatch(transaction);
      movements.push(movement);
    } else {
      for (const batch of sortedBatches) {
        if (remainingQuantity <= 0) break;

        if (batch.remainingQuantity >= 0) continue;

        const qtyToAdd = Number(
          Math.min(-batch.remainingQuantity, remainingQuantity).toFixed(6),
        );
        batch.remainingQuantity = Number(
          (batch.remainingQuantity + qtyToAdd).toFixed(6),
        );
        remainingQuantity = Number((remainingQuantity - qtyToAdd).toFixed(6));

        movements.push({
          batchId: batch.id,
          quantity: qtyToAdd,
          date: transaction.date,
          locationId: this.defaultLocationId,
          type: transaction.type,
        });
      }

      if (remainingQuantity > 0) {
        const batch = sortedBatches[sortedBatches.length - 1];

        if (!batch) {
          console.error("No batch found to allocate to.");
          throw new Error("No batch found to allocate to.");
        }

        batch.remainingQuantity += remainingQuantity;

        movements.push({
          batchId: batch.id,
          quantity: remainingQuantity,
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
      if (transaction.quantity > 0) {
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
        quantity: transaction.quantity,
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

    const movement = await this.createBatch(transaction);

    const productionJobItem = await db
      .insert(schema.productionBatchOutput)
      .values({
        jobId: productionJobId,
        batchId: movement.batchId,
        productionQuantity: transaction.quantity,
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
}
