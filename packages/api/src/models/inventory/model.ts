import Decimal from "decimal.js";

import type { Schema } from "@repo/db";
import { and, asc, desc, eq, ne, schema, sql } from "@repo/db";

import type { Transaction } from "../../db";
import { db } from "../../db";
import { datatable } from "../../lib/datatables";

Decimal.set({ precision: 15, rounding: Decimal.ROUND_HALF_UP });

export interface InventoryReference {
  componentId: string;
  batchId?: number;
}

export interface LedgerEntryDetails {
  userId: string;
  type: Schema["transactionType"]["enumValues"][number];
  salesDespatchItemId?: number;
  productionJobAllocationId?: number;
}

export interface InventoryEntry {
  componentId: string;
  batchId?: number;
  locationId: number;
  quantity: Decimal;
  lots: {
    id: number;
    quantity: Decimal;
  }[];
}

export const fetchLotInventory = async (
  tx: Transaction,
  reference: InventoryReference,
  locationId: number,
  priority: "oldest" | "newest" = "oldest",
) => {
  return await tx
    .select({
      id: schema.inventoryLot.componentLotId,
      componentId: schema.componentLot.componentId,
      batchId: schema.componentLot.batchId,
      entryDate: schema.componentLot.entryDate,
      quantity: schema.inventoryLot.freeQuantity,
      locationId: schema.inventoryLot.locationId,
    })
    .from(schema.inventoryLot)
    .leftJoin(
      schema.componentLot,
      eq(schema.inventoryLot.componentLotId, schema.componentLot.id),
    )
    .where(
      and(
        eq(schema.inventoryLot.locationId, locationId),
        eq(schema.componentLot.componentId, reference.componentId),
        ne(schema.inventoryLot.freeQuantity, schema.inventoryLot.totalQuantity),
        reference.batchId
          ? eq(schema.componentLot.batchId, reference.batchId)
          : undefined,
      ),
    )
    .orderBy(
      priority === "oldest"
        ? asc(schema.componentLot.entryDate)
        : desc(schema.componentLot.entryDate),
    );
};

export const calculateOutboundEntry = async (
  tx: Transaction,
  reference: InventoryReference,
  locationId: number,
  quantity: Decimal,
): Promise<InventoryEntry> => {
  if (quantity.lte(0)) {
    throw new Error("Quantity must be greater than 0");
  }

  const lots = await fetchLotInventory(tx, reference, locationId, "oldest");

  let remainingQuantity = quantity;

  const assignedLots: { id: number; quantity: Decimal }[] = [];

  for (const lot of lots) {
    if (lot.quantity.isZero()) {
      continue;
    }

    assignedLots.push({
      id: lot.id,
      quantity: Decimal.min(lot.quantity, remainingQuantity),
    });

    remainingQuantity = remainingQuantity.sub(lot.quantity);
    if (remainingQuantity.lte(0)) {
      break;
    }
  }

  if (remainingQuantity.gt(0)) {
    throw new Error("Not enough lots to assign");
  }

  return {
    componentId: reference.componentId,
    batchId: reference.batchId,
    locationId,
    quantity: quantity,
    lots: assignedLots,
  };
};

export const createInboundEntry = async (
  tx: Transaction,
  reference: InventoryReference,
  locationId: number,
  quantity: Decimal,
  entryDate: Date,
  purchaseReceiptItemId?: number,
  productionJobId?: number,
): Promise<InventoryEntry> => {
  const lots = await tx
    .insert(schema.componentLot)
    .values([
      {
        componentId: reference.componentId,
        batchId: reference.batchId,
        entryDate,
        purchaseReceiptItemId,
        productionJobId,
      },
    ])
    .returning({
      id: schema.componentLot.id,
      componentId: schema.componentLot.componentId,
      batchId: schema.componentLot.batchId,
    });

  const lot = lots[0];

  if (!lot) {
    throw new Error("Failed to create lot");
  }

  return {
    componentId: reference.componentId,
    batchId: reference.batchId,
    locationId,
    quantity: quantity,
    lots: [{ id: lot.id, quantity: quantity }],
  };
};

export const assignInboundEntry = async (
  tx: Transaction,
  reference: InventoryReference,
  locationId: number,
  quantity: Decimal,
  entryDate?: Date,
): Promise<InventoryEntry> => {
  if (quantity.lte(0)) {
    throw new Error("Quantity must be greater than 0");
  }

  const lots = await fetchLotInventory(tx, reference, locationId, "newest");

  const lot = lots[0];

  if (!lot) {
    return await createInboundEntry(
      tx,
      reference,
      locationId,
      quantity,
      entryDate ?? new Date(),
    );
  }

  return {
    componentId: reference.componentId,
    batchId: reference.batchId,
    locationId,
    quantity,
    lots: [{ id: lot.id, quantity: quantity }],
  };
};

export const logToLedger = async (
  tx: Transaction,
  direction: "inbound" | "outbound",
  entry: InventoryEntry,
  details: LedgerEntryDetails,
) => {
  const promises = [];

  promises.push(
    tx.insert(schema.inventoryLotLedger).values(
      entry.lots.map((lot) => ({
        componentLotId: lot.id,
        quantity:
          direction === "inbound" ? lot.quantity : lot.quantity.negated(),
        locationId: entry.locationId,
        ...details,
      })),
    ),
  );

  promises.push(
    tx.insert(schema.inventoryLedger).values({
      componentId: entry.componentId,
      batchId: entry.batchId,
      quantity:
        direction === "inbound" ? entry.quantity : entry.quantity.negated(),
      locationId: entry.locationId,
      ...details,
    }),
  );

  await Promise.all(promises);
};

export const updateInventory = async (
  tx: Transaction,
  entry: InventoryEntry,
  type: "inbound" | "outbound" | "allocation" | "deallocation",
) => {
  const promises = [];

  const getTotal = (quantity: Decimal): Decimal => {
    switch (type) {
      case "inbound":
        return quantity;
      case "outbound":
        return quantity.negated();
      case "allocation":
        return new Decimal(0);
      case "deallocation":
        return new Decimal(0);
    }
  };

  const getAllocated = (quantity: Decimal): Decimal => {
    switch (type) {
      case "inbound":
        return new Decimal(0);
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
        return new Decimal(0);
      case "deallocation":
        return quantity;
    }
  };

  promises.push(
    tx
      .insert(schema.inventoryLot)
      .values(
        entry.lots.map((lot) => ({
          componentLotId: lot.id,
          locationId: entry.locationId,
          totalQuantity: getTotal(lot.quantity),
          allocatedQuantity: getAllocated(lot.quantity),
          freeQuantity: getFree(lot.quantity),
        })),
      )
      .onConflictDoUpdate({
        target: [
          schema.inventoryLot.componentLotId,
          schema.inventoryLot.locationId,
        ],
        set: {
          totalQuantity: sql.raw(
            `"inventory_lot"."${schema.inventoryLot.totalQuantity.name}" + excluded."${schema.inventoryLot.totalQuantity.name}"`,
          ),
          allocatedQuantity: sql.raw(
            `"inventory_lot"."${schema.inventoryLot.allocatedQuantity.name}" + excluded."${schema.inventoryLot.allocatedQuantity.name}"`,
          ),
          freeQuantity: sql.raw(
            `"inventory_lot"."${schema.inventoryLot.freeQuantity.name}" + excluded."${schema.inventoryLot.freeQuantity.name}"`,
          ),
        },
      }),
  );

  promises.push(
    tx
      .insert(schema.inventory)
      .values({
        componentId: entry.componentId,
        batchId: entry.batchId,
        locationId: entry.locationId,
        totalQuantity: getTotal(entry.quantity),
        allocatedQuantity: getAllocated(entry.quantity),
        freeQuantity: getFree(entry.quantity),
        entryDate: new Date(),
      })
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
      }),
  );

  await Promise.all(promises);
};

const overview = db
  .select({
    componentId: schema.inventory.componentId,
    componentDescription: schema.component.description,
    componentUnit: schema.component.unit,
    isStockTracked: schema.component.isStockTracked,
    isBatchTracked: schema.component.isBatchTracked,
    batchId: schema.inventory.batchId,
    batchReference: schema.batch.batchReference,
    entryDate: schema.inventory.entryDate,
    locationId: schema.inventory.locationId,
    locationName: schema.location.name,
    totalQuantity: schema.inventory.totalQuantity,
    allocatedQuantity: schema.inventory.allocatedQuantity,
    freeQuantity: schema.inventory.freeQuantity,
  })
  .from(schema.inventory)
  .leftJoin(
    schema.component,
    eq(schema.inventory.componentId, schema.component.id),
  )
  .leftJoin(
    schema.location,
    eq(schema.inventory.locationId, schema.location.id),
  )
  .leftJoin(schema.batch, eq(schema.inventory.batchId, schema.batch.id))
  .as("overview");

export default datatable(
  {
    componentId: "string",
    componentDescription: "string",
    componentUnit: "string",
    isStockTracked: "boolean",
    isBatchTracked: "boolean",
    batchId: "number",
    batchReference: "string",
    entryDate: "date",
    locationId: "number",
    locationName: "string",
    totalQuantity: "decimal",
    allocatedQuantity: "decimal",
    freeQuantity: "decimal",
  },
  overview,
);
