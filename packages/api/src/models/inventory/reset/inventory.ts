import Decimal from "decimal.js";

import type { Schema } from "@repo/db";
import { schema, sql } from "@repo/db";

import { db } from "../../../db";

interface InventoryReference {
  componentId: string;
  batchId: number | null;
}

Decimal.set({ precision: 15, rounding: Decimal.ROUND_HALF_UP });

class IdentityManager {
  private nextId = -1;
  private identities = new Map<number, number | undefined>();

  create() {
    const id = this.nextId--;
    this.identities.set(id, undefined);
    return id;
  }

  setRemoteId(id: number, remoteId: number) {
    if (id >= 0 || remoteId <= 0) {
      console.log(id, remoteId);
      throw new Error("Invalid id");
    }

    this.identities.set(id, remoteId);
  }

  getRemoteId(id: number): number {
    if (id >= 0) {
      console.log(id);
      throw new Error("Invalid id");
    }

    const remoteId = this.identities.get(id);

    if (!remoteId) {
      throw new Error("Remote id not found");
    }

    return remoteId;
  }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

class BatchRepository {
  private batches = new Map<string, typeof schema.batch.$inferSelect>();

  constructor(private identities: IdentityManager) {}

  getKey(componentId: string, batchReference: string) {
    return `${componentId}-${batchReference}`;
  }

  getBatch(componentId: string, batchReference?: string) {
    return this.batches.get(this.getKey(componentId, batchReference ?? ""));
  }

  upsert(data: typeof schema.batch.$inferSelect) {
    const key = this.getKey(data.componentId, data.batchReference ?? "");
    let batch = this.batches.get(key);

    if (!batch) {
      batch = {
        id: this.identities.create(),
        componentId: data.componentId,
        batchReference: data.batchReference ?? null,
        createdAt: data.createdAt,
        lastModified: data.lastModified,
      };

      this.batches.set(key, batch);
    }

    return batch;
  }

  async save() {
    const batches = Array.from(this.batches.values());
    console.log(`Saving ${batches.length} batches`);
    if (batches.length === 0) return;

    const chunks = chunkArray(batches, 1000);
    for (const chunk of chunks) {
      await db
        .insert(schema.batch)
        .values(chunk.map(({ id: _, ...batch }) => batch))
        .returning()
        .then((savedBatches) => {
          savedBatches.forEach((batch, index) => {
            const original = chunk[index];
            if (!original) {
              throw new Error("Batch not found");
            }
            this.identities.setRemoteId(original.id, batch.id);
          });
        });
    }
  }
}

class ComponentLotRepository {
  private componentLots = new Map<
    string,
    typeof schema.componentLot.$inferSelect
  >();
  private componentLotsByComponent = new Map<string, string[]>();

  constructor(private identities: IdentityManager) {}

  getKey(componentId: string, batchId: number | null, entryDate: Date) {
    return `${componentId}-${batchId ?? "unbatched"}-${entryDate.toLocaleDateString("en-GB")}`;
  }

  private getComponentKey(componentId: string) {
    return `${componentId}`;
  }

  upsert(data: typeof schema.componentLot.$inferSelect) {
    const key = this.getKey(data.componentId, data.batchId, data.entryDate);
    let lot = this.componentLots.get(key);

    if (!lot) {
      lot = {
        ...data,
        id: this.identities.create(),
      };

      this.componentLots.set(key, lot);

      const componentKey = this.getComponentKey(data.componentId);
      const lots = this.componentLotsByComponent.get(componentKey) ?? [];
      lots.push(key);
      this.componentLotsByComponent.set(componentKey, lots);
    } else {
      // Update the existing lot with new data
      lot = {
        ...lot,
        ...data,
        // Preserve the original ID
        id: lot.id,
        // Update timestamps if needed
        lastModified:
          data.lastModified > lot.lastModified
            ? data.lastModified
            : lot.lastModified,
        createdAt:
          data.createdAt < lot.createdAt ? data.createdAt : lot.createdAt,
      };
      this.componentLots.set(key, lot);
    }

    return lot;
  }

  getLotsForComponent(componentId: string) {
    const key = this.getComponentKey(componentId);

    const lotIds = this.componentLotsByComponent.get(key) ?? [];

    return lotIds
      .map((id) => this.componentLots.get(id))
      .filter((lot): lot is typeof schema.componentLot.$inferSelect => !!lot);
  }

  async save() {
    const lots = Array.from(this.componentLots.values());
    console.log(`Saving ${lots.length} component lots`);
    if (lots.length === 0) return;

    const chunks = chunkArray(lots, 1000);
    for (const chunk of chunks) {
      await db
        .insert(schema.componentLot)
        .values(
          chunk.map(({ id: _, ...lot }) => ({
            ...lot,
            batchId: lot.batchId
              ? this.identities.getRemoteId(lot.batchId)
              : null,
            purchaseReceiptItemId: lot.purchaseReceiptItemId
              ? this.identities.getRemoteId(lot.purchaseReceiptItemId)
              : null,
            productionJobId: lot.productionJobId
              ? this.identities.getRemoteId(lot.productionJobId)
              : null,
          })),
        )
        .returning()
        .then((savedLots) => {
          savedLots.forEach((lot, index) => {
            const original = chunk[index];
            if (!original) {
              throw new Error("Lot not found");
            }
            this.identities.setRemoteId(original.id, lot.id);
          });
        });
    }
  }
}

class InventoryLotRepository {
  private inventoryLots = new Map<
    string,
    typeof schema.inventoryLot.$inferSelect
  >();

  private inventoryIdMap = new Map<number, string[]>();

  constructor(private identities: IdentityManager) {}

  getKey(componentLotId: number, locationId: number) {
    return `${componentLotId}-${locationId}`;
  }

  getForId(componentLotId: number) {
    const keys = this.inventoryIdMap.get(componentLotId);
    if (!keys) {
      throw new Error("Inventory lot not found");
    }

    return keys.map((key) => this.inventoryLots.get(key));
  }

  upsert(data: typeof schema.inventoryLot.$inferSelect) {
    const key = this.getKey(data.componentLotId, data.locationId);
    let lot = this.inventoryLots.get(key);

    if (!lot) {
      lot = data;
      this.inventoryLots.set(key, lot);
      const lots = this.inventoryIdMap.get(data.componentLotId) ?? [];
      lots.push(key);
      this.inventoryIdMap.set(data.componentLotId, lots);
    } else {
      lot.totalQuantity = lot.totalQuantity.plus(data.totalQuantity);
      lot.allocatedQuantity = lot.allocatedQuantity.plus(
        data.allocatedQuantity,
      );
      lot.freeQuantity = lot.freeQuantity.plus(data.freeQuantity);
    }

    return lot;
  }

  async save() {
    const lots = Array.from(this.inventoryLots.values());
    console.log(`Saving ${lots.length} inventory lots`);
    if (lots.length === 0) return;

    const chunks = chunkArray(lots, 1000);
    for (const chunk of chunks) {
      await db
        .insert(schema.inventoryLot)
        .values(
          chunk.map(({ ...lot }) => ({
            ...lot,
            componentLotId: this.identities.getRemoteId(lot.componentLotId),
          })),
        )
        .returning();
    }
  }
}

class InventoryLotLedgerRepository {
  private ledger: (typeof schema.inventoryLotLedger.$inferInsert)[] = [];

  constructor(private identities: IdentityManager) {}

  addEntry(data: typeof schema.inventoryLotLedger.$inferInsert) {
    this.ledger.push(data);
  }

  async save() {
    console.log(`Saving ${this.ledger.length} inventory lot ledger entries`);
    if (this.ledger.length === 0) return;

    const chunks = chunkArray(this.ledger, 1000);
    for (const chunk of chunks) {
      await db.insert(schema.inventoryLotLedger).values(
        chunk.map(({ id: _, ...entry }) => ({
          ...entry,
          componentLotId: this.identities.getRemoteId(entry.componentLotId),
          salesDespatchItemId: entry.salesDespatchItemId
            ? this.identities.getRemoteId(entry.salesDespatchItemId)
            : null,
          productionJobAllocationId: entry.productionJobAllocationId
            ? this.identities.getRemoteId(entry.productionJobAllocationId)
            : null,
        })),
      );
    }
  }
}

class InventoryRepository {
  private inventories = new Map<string, typeof schema.inventory.$inferSelect>();

  constructor(private identities: IdentityManager) {}

  private getKey(
    componentId: string,
    batchId: number | null,
    locationId: number,
  ) {
    return `${componentId}-${batchId ?? "unbatched"}-${locationId}`;
  }

  getInventory(reference: InventoryReference, locationId: number) {
    return this.inventories.get(
      this.getKey(reference.componentId, reference.batchId, locationId),
    );
  }

  upsert(data: typeof schema.inventory.$inferSelect) {
    const key = this.getKey(data.componentId, data.batchId, data.locationId);
    let inventory = this.inventories.get(key);

    if (!inventory) {
      inventory = {
        ...data,
        id: this.identities.create(),
      };
      this.inventories.set(key, inventory);
    } else {
      inventory.totalQuantity = inventory.totalQuantity.plus(
        data.totalQuantity,
      );
      inventory.allocatedQuantity = inventory.allocatedQuantity.plus(
        data.allocatedQuantity,
      );
      inventory.freeQuantity = inventory.freeQuantity.plus(data.freeQuantity);
    }

    return inventory;
  }

  getAllInventories() {
    return Array.from(this.inventories.values());
  }

  async save() {
    const inventories = this.getAllInventories();
    console.log(`Saving ${inventories.length} inventories`);
    if (inventories.length === 0) return;

    const chunks = chunkArray(inventories, 1000);
    for (const chunk of chunks) {
      await db
        .insert(schema.inventory)
        .values(
          chunk.map(({ id: _, ...inventory }) => ({
            ...inventory,
            batchId: inventory.batchId
              ? this.identities.getRemoteId(inventory.batchId)
              : null,
          })),
        )
        .onConflictDoUpdate({
          target: [
            schema.inventory.componentId,
            schema.inventory.batchId,
            schema.inventory.locationId,
          ],
          set: {
            totalQuantity: sql.raw(
              `"inventory"."${schema.inventory.totalQuantity.name}" + excluded."${schema.inventory.totalQuantity.name}"`,
            ),
            allocatedQuantity: sql.raw(
              `"inventory"."${schema.inventory.allocatedQuantity.name}" + excluded."${schema.inventory.allocatedQuantity.name}"`,
            ),
            freeQuantity: sql.raw(
              `"inventory"."${schema.inventory.freeQuantity.name}" + excluded."${schema.inventory.freeQuantity.name}"`,
            ),
          },
        });
    }
  }
}

export class InventoryLedgerRepository {
  private ledger: (typeof schema.inventoryLedger.$inferInsert)[] = [];

  constructor(private identities: IdentityManager) {}

  addEntry(
    componentId: string,
    batchId: number | null,
    locationId: number,
    quantity: Decimal,
    details: LedgerEntryDetails,
  ) {
    this.ledger.push({
      componentId,
      batchId,
      locationId,
      quantity,
      ...details,
    });
  }

  async save() {
    console.log(`Saving ${this.ledger.length} inventory ledger entries`);
    if (this.ledger.length === 0) return;

    const chunks = chunkArray(this.ledger, 1000);
    for (const chunk of chunks) {
      await db.insert(schema.inventoryLedger).values(
        chunk.map(({ id: _, ...entry }) => ({
          ...entry,
          batchId: entry.batchId
            ? this.identities.getRemoteId(entry.batchId)
            : null,
          salesDespatchItemId: entry.salesDespatchItemId
            ? this.identities.getRemoteId(entry.salesDespatchItemId)
            : null,
          productionJobAllocationId: entry.productionJobAllocationId
            ? this.identities.getRemoteId(entry.productionJobAllocationId)
            : null,
        })),
      );
    }
  }
}

export interface LedgerEntryDetails {
  date: Date;
  userId: string;
  type: Schema["transactionType"]["enumValues"][number];
  salesDespatchItemId?: number;
  productionJobAllocationId?: number;
}

export interface InventoryEntry {
  componentId: string;
  locationId: number;
  quantity: Decimal;
  entryDate: Date;
  lots: {
    id: number;
    quantity: Decimal;
    batchId: number | null;
  }[];
}

// Repository classes
export class ProductionJobRepository {
  private jobs = new Map<string, typeof schema.productionJob.$inferSelect>();

  constructor(private identities: IdentityManager) {}

  private getKey(componentId: string, batchId: number | null, createdAt: Date) {
    return `${componentId}-${batchId ?? "unbatched"}-${createdAt.toLocaleDateString("en-GB")}`;
  }

  upsert(data: typeof schema.productionJob.$inferSelect) {
    const key = this.getKey(data.componentId, data.batchId, data.createdAt);
    let job = this.jobs.get(key);

    if (job) {
      if (data.lastModified > job.lastModified) {
        job.lastModified = data.lastModified;
      }

      if (data.createdAt < job.createdAt) {
        job.createdAt = data.createdAt;
      }

      job.targetQuantity = job.targetQuantity.plus(data.targetQuantity);
      job.quantityProduced = job.quantityProduced.plus(data.quantityProduced);
    } else {
      job = {
        ...data,
        id: this.identities.create(),
      };
      this.jobs.set(key, job);
    }

    return job;
  }

  async save() {
    const jobs = Array.from(this.jobs.values());
    console.log(`Saving ${jobs.length} production jobs`);
    if (jobs.length === 0) return;

    const chunks = chunkArray(jobs, 1000);
    for (const chunk of chunks) {
      await db
        .insert(schema.productionJob)
        .values(
          chunk.map(({ id: _, ...job }) => ({
            ...job,
            batchId: job.batchId
              ? this.identities.getRemoteId(job.batchId)
              : null,
          })),
        )
        .returning()
        .then((jobs) => {
          jobs.forEach((job, index) => {
            const original = chunk[index];
            if (!original) {
              throw new Error("Job not found");
            }

            this.identities.setRemoteId(original.id, job.id);
          });
        });
    }
  }
}

export class ProductionJobAllocationRepository {
  private allocations = new Map<
    string,
    typeof schema.productionJobAllocation.$inferSelect
  >();

  constructor(private identities: IdentityManager) {}

  getKey(
    productionJobId: number,
    componentId: string,
    locationId: number,
    batchId: number | null,
  ) {
    return `${productionJobId}-${componentId}-${locationId}-${batchId ?? "unbatched"}`;
  }

  upsert(data: typeof schema.productionJobAllocation.$inferSelect) {
    const key = this.getKey(
      data.productionJobId,
      data.componentId,
      data.locationId,
      data.batchId,
    );
    let allocation = this.allocations.get(key);

    if (allocation) {
      if (data.lastModified > allocation.lastModified) {
        allocation.lastModified = data.lastModified;
      }

      if (data.createdAt < allocation.createdAt) {
        allocation.createdAt = data.createdAt;
      }

      allocation.totalQuantity = allocation.totalQuantity.plus(
        data.totalQuantity,
      );

      allocation.remainingQuantity = allocation.remainingQuantity.plus(
        data.remainingQuantity,
      );

      allocation.usedQuantity = allocation.usedQuantity.plus(data.usedQuantity);
    } else {
      allocation = { ...data, id: this.identities.create() };
      this.allocations.set(key, allocation);
    }

    return allocation;
  }

  async save() {
    const allocations = Array.from(this.allocations.values());
    console.log(`Saving ${allocations.length} production job allocations`);
    if (allocations.length === 0) return;

    const chunks = chunkArray(allocations, 1000);
    for (const chunk of chunks) {
      await db
        .insert(schema.productionJobAllocation)
        .values(
          chunk.map(({ id: _, ...allocation }) => ({
            ...allocation,
            productionJobId: this.identities.getRemoteId(
              allocation.productionJobId,
            ),
          })),
        )
        .returning()
        .then((allocations) => {
          allocations.forEach((allocation, index) => {
            const original = chunk[index];
            if (!original) {
              throw new Error("Allocation not found");
            }

            this.identities.setRemoteId(original.id, allocation.id);
          });
        });
    }
  }
}

export class SalesDespatchRepository {
  private despatches = new Map<
    string,
    typeof schema.salesDespatch.$inferSelect
  >();

  constructor(private identities: IdentityManager) {}

  private getKey(orderId: number, despatchDate: Date) {
    return `${orderId}-${despatchDate.toLocaleDateString("en-GB")}`;
  }

  upsert(
    data: typeof schema.salesDespatch.$inferSelect & { despatchDate: Date },
  ) {
    const key = this.getKey(data.orderId, data.despatchDate);
    let despatch = this.despatches.get(key);

    if (despatch) {
      if (data.lastModified > despatch.lastModified) {
        despatch.lastModified = data.lastModified;
      }

      if (data.createdAt < despatch.createdAt) {
        despatch.createdAt = data.createdAt;
      }
    } else {
      despatch = { ...data, id: this.identities.create() };
      this.despatches.set(key, despatch);
    }

    return despatch;
  }

  async save() {
    console.log(`Saving ${this.despatches.size} sales despatches`);
    if (this.despatches.size === 0) return;

    const despatches = Array.from(this.despatches.values());
    const chunks = chunkArray(despatches, 1000);
    for (const chunk of chunks) {
      await db
        .insert(schema.salesDespatch)
        .values(
          chunk.map(({ id: _, ...despatch }) => ({
            ...despatch,
          })),
        )
        .returning()
        .then((despatches) => {
          despatches.forEach((despatch, index) => {
            const original = chunk[index];
            if (!original) {
              throw new Error("Despatch not found");
            }

            this.identities.setRemoteId(original.id, despatch.id);
          });
        });
    }
  }
}

export class SalesDespatchItemRepository {
  private items = new Map<
    string,
    typeof schema.salesDespatchItem.$inferSelect
  >();

  constructor(private identities: IdentityManager) {}

  private getKey(receiptId: number, componentId: string) {
    return `${receiptId}-${componentId}`;
  }

  upsert(data: typeof schema.salesDespatchItem.$inferSelect) {
    const key = this.getKey(data.despatchId, data.componentId);
    let item = this.items.get(key);

    if (item) {
      if (data.lastModified > item.lastModified) {
        item.lastModified = data.lastModified;
      }

      if (data.createdAt < item.createdAt) {
        item.createdAt = data.createdAt;
      }

      item.quantity = item.quantity.plus(data.quantity);
    } else {
      item = { ...data, id: this.identities.create() };
      this.items.set(key, item);
    }

    return item;
  }

  async save() {
    const items = Array.from(this.items.values());
    console.log(`Saving ${items.length} sales despatch items`);
    if (items.length === 0) return;

    const chunks = chunkArray(items, 1000);
    for (const chunk of chunks) {
      await db
        .insert(schema.salesDespatchItem)
        .values(
          chunk.map(({ id: _, ...item }) => ({
            ...item,
            despatchId: this.identities.getRemoteId(item.despatchId),
          })),
        )
        .returning()
        .then((items) => {
          items.forEach((item, index) => {
            const original = chunk[index];
            if (!original) {
              throw new Error("Item not found");
            }

            this.identities.setRemoteId(original.id, item.id);
          });
        });
    }
  }
}

export class PurchaseReceiptRepository {
  private receipts = new Map<
    string,
    typeof schema.purchaseReceipt.$inferSelect
  >();

  constructor(private identities: IdentityManager) {}

  private getKey(orderId: number, receiptDate: Date) {
    return `${orderId}-${receiptDate.toLocaleDateString("en-GB")}`;
  }

  upsert(data: typeof schema.purchaseReceipt.$inferSelect) {
    const key = this.getKey(data.orderId, data.receiptDate);
    let receipt = this.receipts.get(key);

    if (receipt) {
      if (data.lastModified > receipt.lastModified) {
        receipt.lastModified = data.lastModified;
      }

      if (data.createdAt < receipt.createdAt) {
        receipt.createdAt = data.createdAt;
      }
    } else {
      receipt = { ...data, id: this.identities.create() };
      this.receipts.set(key, receipt);
    }

    return receipt;
  }

  async save() {
    console.log(`Saving ${this.receipts.size} purchase receipts`);
    if (this.receipts.size === 0) return;

    const receipts = Array.from(this.receipts.values());
    const chunks = chunkArray(receipts, 1000);
    for (const chunk of chunks) {
      await db
        .insert(schema.purchaseReceipt)
        .values(
          chunk.map(({ id: _, ...receipt }) => ({
            ...receipt,
          })),
        )
        .returning()
        .then((receipts) => {
          receipts.forEach((receipt, index) => {
            const original = chunk[index];
            if (!original) {
              throw new Error("Receipt not found");
            }

            this.identities.setRemoteId(original.id, receipt.id);
          });
        });
    }
  }
}

export class PurchaseReceiptItemRepository {
  private items = new Map<
    string,
    typeof schema.purchaseReceiptItem.$inferSelect
  >();

  constructor(private identities: IdentityManager) {}

  private getKey(receiptId: number, componentId: string) {
    return `${receiptId}-${componentId}`;
  }

  upsert(data: typeof schema.purchaseReceiptItem.$inferSelect) {
    const key = this.getKey(data.receiptId, data.componentId);
    let item = this.items.get(key);

    if (item) {
      if (data.lastModified > item.lastModified) {
        item.lastModified = data.lastModified;
      }

      if (data.createdAt < item.createdAt) {
        item.createdAt = data.createdAt;
      }

      item.quantity = item.quantity.plus(data.quantity);
    } else {
      item = { ...data, id: this.identities.create() };
      this.items.set(key, item);
    }

    return item;
  }

  async save() {
    const items = Array.from(this.items.values());
    console.log(`Saving ${items.length} purchase receipt items`);
    if (items.length === 0) return;

    const chunks = chunkArray(items, 1000);
    for (const chunk of chunks) {
      await db
        .insert(schema.purchaseReceiptItem)
        .values(
          chunk.map(({ id: _, ...item }) => ({
            ...item,
            receiptId: this.identities.getRemoteId(item.receiptId),
          })),
        )
        .returning()
        .then((items) => {
          items.forEach((item, index) => {
            const original = chunk[index];
            if (!original) {
              throw new Error("Item not found");
            }

            this.identities.setRemoteId(original.id, item.id);
          });
        });
    }
  }
}

export class InventoryBatchProcessor {
  private identities = new IdentityManager();
  batches = new BatchRepository(this.identities);
  componentLots = new ComponentLotRepository(this.identities);
  inventoryLots = new InventoryLotRepository(this.identities);
  inventoryLedger = new InventoryLedgerRepository(this.identities);
  inventoryLotLedger = new InventoryLotLedgerRepository(this.identities);
  inventories = new InventoryRepository(this.identities);
  purchaseReceiptRepository = new PurchaseReceiptRepository(this.identities);
  purchaseReceiptItemRepository = new PurchaseReceiptItemRepository(
    this.identities,
  );
  salesDespatchRepository = new SalesDespatchRepository(this.identities);
  salesDespatchItemRepository = new SalesDespatchItemRepository(
    this.identities,
  );
  productionJobRepository = new ProductionJobRepository(this.identities);
  productionJobAllocationRepository = new ProductionJobAllocationRepository(
    this.identities,
  );

  async saveAll() {
    await this.batches.save();
    await this.productionJobRepository.save();
    await this.purchaseReceiptRepository.save();
    await this.purchaseReceiptItemRepository.save();
    await this.salesDespatchRepository.save();
    await this.salesDespatchItemRepository.save();
    await this.productionJobAllocationRepository.save();
    await this.componentLots.save();
    await this.inventoryLots.save();
    await this.inventories.save();
    await this.inventoryLedger.save();
    await this.inventoryLotLedger.save();
  }

  calculateOutboundEntry(
    reference: InventoryReference,
    locationId: number,
    quantity: Decimal,
  ): InventoryEntry {
    if (quantity.lte(0)) {
      throw new Error("Quantity must be greater than 0");
    }

    const componentLots = this.componentLots.getLotsForComponent(
      reference.componentId,
    );

    if (componentLots.length === 0) {
      const lot = this.componentLots.upsert({
        id: 0,
        componentId: reference.componentId,
        batchId: reference.batchId,
        entryDate: new Date("2016-01-01"),
        createdAt: new Date("2016-01-01"),
        lastModified: new Date("2016-01-01"),
        purchaseReceiptItemId: null,
        productionJobId: null,
      });

      componentLots.push(lot);

      this.inventoryLots.upsert({
        componentLotId: lot.id,
        locationId,
        totalQuantity: new Decimal(0),
        allocatedQuantity: new Decimal(0),
        freeQuantity: new Decimal(0),
        createdAt: new Date("2016-01-01"),
        lastModified: new Date("2016-01-01"),
      });
    }

    const lots = componentLots.flatMap((lot) =>
      this.inventoryLots.getForId(lot.id).map((l) =>
        l === undefined
          ? undefined
          : {
              componentId: lot.componentId,
              batchId: lot.batchId,
              ...l,
            },
      ),
    );

    let remainingQuantity = quantity;
    const assignedLots: {
      id: number;
      quantity: Decimal;
      batchId: number | null;
    }[] = [];

    for (const lot of lots) {
      if (!lot || lot.freeQuantity.isZero()) {
        continue;
      }

      const lotQuantity = Decimal.min(lot.freeQuantity, remainingQuantity);
      assignedLots.push({
        id: lot.componentLotId,
        quantity: lotQuantity,
        batchId: lot.batchId,
      });

      remainingQuantity = remainingQuantity.sub(lotQuantity);
      if (remainingQuantity.lte(0)) {
        break;
      }
    }

    if (remainingQuantity.gt(0) && lots.length > 0) {
      const lot = lots[0];

      if (lot) {
        assignedLots.push({
          id: lot.componentLotId,
          quantity: remainingQuantity,
          batchId: lot.batchId,
        });
      } else {
        throw new Error("Not enough inventory available");
      }
    }

    return {
      componentId: reference.componentId,
      locationId,
      entryDate: new Date(),
      quantity,
      lots: assignedLots,
    };
  }

  createInboundEntry(
    reference: InventoryReference,
    locationId: number,
    quantity: Decimal,
    entryDate: Date,
    createdAt: Date,
    lastModified: Date,
    purchaseReceiptItemId: number | null = null,
    productionJobId: number | null = null,
  ): InventoryEntry {
    const lot = this.componentLots.upsert({
      id: 0,
      componentId: reference.componentId,
      batchId: reference.batchId,
      entryDate,
      createdAt,
      lastModified,
      purchaseReceiptItemId,
      productionJobId,
    });

    return {
      componentId: reference.componentId,
      locationId,
      entryDate,
      quantity,
      lots: [{ id: lot.id, quantity, batchId: lot.batchId }],
    };
  }

  assignInboundEntry(
    reference: InventoryReference,
    locationId: number,
    quantity: Decimal,
    entryDate: Date,
    createdAt: Date,
    lastModified: Date,
  ): InventoryEntry {
    if (quantity.lte(0)) {
      throw new Error("Quantity must be greater than 0");
    }

    const componentLots = this.componentLots.getLotsForComponent(
      reference.componentId,
    );

    if (componentLots.length === 0) {
      throw new Error("No lots found for component");
    }

    const lots = componentLots.flatMap((lot) =>
      this.inventoryLots.getForId(lot.id),
    );

    const lot = lots[0];

    if (!lot) {
      return this.createInboundEntry(
        reference,
        locationId,
        quantity,
        entryDate,
        createdAt,
        lastModified,
      );
    }

    return {
      componentId: reference.componentId,
      locationId,
      quantity,
      entryDate,
      lots: [{ id: lot.componentLotId, quantity, batchId: reference.batchId }],
    };
  }

  logToLedger(
    direction: "inbound" | "outbound",
    entry: InventoryEntry,
    details: LedgerEntryDetails,
  ) {
    const batches = new Map<number, Decimal>();
    // Log lot-level entries
    for (const lot of entry.lots) {
      const batch = batches.get(lot.batchId ?? 0);

      if (!batch) {
        batches.set(lot.batchId ?? 0, lot.quantity);
      } else {
        batches.set(lot.batchId ?? 0, batch.plus(lot.quantity));
      }

      this.inventoryLotLedger.addEntry({
        componentLotId: lot.id,
        locationId: entry.locationId,
        quantity:
          direction === "inbound" ? lot.quantity : lot.quantity.negated(),

        ...details,
      });
    }

    // Log inventory-level entry

    for (const [batchId, quantity] of batches.entries()) {
      this.inventoryLedger.addEntry(
        entry.componentId,
        batchId,
        entry.locationId,
        direction === "inbound" ? quantity : quantity.negated(),
        details,
      );
    }
  }

  updateInventory(
    entry: InventoryEntry,
    type: "inbound" | "outbound" | "allocation" | "deallocation",
  ) {
    const getTotal = (quantity: Decimal): Decimal => {
      switch (type) {
        case "inbound":
          return quantity;
        case "outbound":
          return quantity.negated();
        case "allocation":
        case "deallocation":
          return new Decimal(0);
      }
    };

    const getAllocated = (quantity: Decimal): Decimal => {
      switch (type) {
        case "inbound":
        case "outbound":
          return new Decimal(0);
        case "allocation":
          return quantity;
        case "deallocation":
          return quantity.negated();
      }
    };

    const getFree = (quantity: Decimal): Decimal => {
      switch (type) {
        case "inbound":
          return quantity;
        case "outbound":
          return quantity.negated();
        case "allocation":
          return quantity.negated();
        case "deallocation":
          return quantity;
      }
    };

    const batches = new Map<number, Decimal>();
    // Update inventory lots
    for (const lot of entry.lots) {
      const batch = batches.get(lot.batchId ?? 0);

      if (!batch) {
        batches.set(lot.batchId ?? 0, lot.quantity);
      } else {
        batches.set(lot.batchId ?? 0, batch.plus(lot.quantity));
      }

      this.inventoryLots.upsert({
        componentLotId: lot.id,
        locationId: entry.locationId,
        totalQuantity: getTotal(lot.quantity),
        allocatedQuantity: getAllocated(lot.quantity),
        freeQuantity: getFree(lot.quantity),
        createdAt: new Date(),
        lastModified: new Date(),
      });
    }

    // Update inventory
    for (const [batchId, quantity] of batches.entries()) {
      this.inventories.upsert({
        id: 0,
        componentId: entry.componentId,
        batchId: batchId,
        locationId: entry.locationId,
        totalQuantity: getTotal(quantity),
        allocatedQuantity: getAllocated(quantity),
        freeQuantity: getFree(quantity),
        entryDate: entry.entryDate,
        createdAt: new Date(),
        lastModified: new Date(),
      });
    }
  }
}
