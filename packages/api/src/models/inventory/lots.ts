import Decimal from "decimal.js";

import { and, asc, desc, eq, gt, schema, sql } from "@repo/db";

import type {
  InboundSource,
  InventoryEntry,
  InventoryLotEntry,
  InventoryQuantities,
  InventoryReference,
} from "./types";
import type { Transaction } from "@/db";

export interface FetchLotInventoryParams {
  reference: InventoryReference;
  locationId: number;
  priority?: "oldest" | "newest";
}

export const fetchLotInventory = async (
  tx: Transaction,
  params: FetchLotInventoryParams,
) => {
  const { reference, locationId, priority = "oldest" } = params;

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
        gt(schema.inventoryLot.freeQuantity, new Decimal(0)),
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

export interface CalculateOutboundEntryParams {
  reference: InventoryReference;
  locationId: number;
  quantity: Decimal;
}

export const calculateOutboundEntry = async (
  tx: Transaction,
  params: CalculateOutboundEntryParams,
): Promise<InventoryEntry> => {
  const { reference, locationId, quantity } = params;

  if (!quantity.isFinite() || quantity.lte(0)) {
    throw new Error("Invalid quantity");
  }

  const lots = await fetchLotInventory(tx, {
    reference,
    locationId,
    priority: "oldest",
  });

  const totalAvailable = lots.reduce(
    (sum, lot) => sum.add(lot.quantity),
    new Decimal(0),
  );
  if (totalAvailable.lt(quantity)) {
    throw new Error("Insufficient stock");
  }

  let remainingQuantity = quantity;

  const assignedLots: InventoryLotEntry[] = [];

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

  return {
    reference,
    locationId,
    quantity: quantity,
    lots: assignedLots,
  };
};

export interface CreateInboundEntryParams {
  reference: InventoryReference;
  locationId: number;
  quantity: Decimal;
  entryDate: Date;
  source: InboundSource;
}

export const createInboundEntry = async (
  tx: Transaction,
  params: CreateInboundEntryParams,
): Promise<InventoryEntry> => {
  const { reference, locationId, quantity, entryDate, source } = params;

  if (!quantity.isFinite() || quantity.lte(0)) {
    throw new Error("Invalid quantity");
  }

  if (entryDate > new Date()) {
    throw new Error("Entry date cannot be in the future");
  }

  const lots = await tx
    .insert(schema.componentLot)
    .values([
      {
        componentId: reference.componentId,
        batchId: reference.batchId,
        entryDate,
        purchaseReceiptItemId:
          source.type === "purchase" ? source.purchaseReceiptItemId : null,
        productionJobId:
          source.type === "production" ? source.productionJobId : null,
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
    reference,
    locationId,
    quantity: quantity,
    lots: [{ id: lot.id, quantity: quantity }],
  };
};

export interface AssignInboundEntryParams {
  reference: InventoryReference;
  locationId: number;
  quantity: Decimal;
  entryDate?: Date;
}

export const assignInboundEntry = async (
  tx: Transaction,
  params: AssignInboundEntryParams,
): Promise<InventoryEntry> => {
  const { reference, locationId, quantity, entryDate = new Date() } = params;

  if (!quantity.isFinite() || quantity.lte(0)) {
    throw new Error("Invalid quantity");
  }

  if (entryDate > new Date()) {
    throw new Error("Entry date cannot be in the future");
  }

  const lots = await fetchLotInventory(tx, {
    reference,
    locationId,
    priority: "newest",
  });

  const lot = lots[0];

  if (!lot) {
    return await createInboundEntry(tx, {
      reference,
      locationId,
      quantity,
      entryDate,
      source: { type: "adjustment" },
    });
  }

  return {
    reference,
    locationId,
    quantity,
    lots: [{ id: lot.id, quantity: quantity }],
  };
};

export interface UpdateLotQuantitiesParams {
  entry: InventoryEntry;
  quantities: InventoryQuantities;
}

export const updateLotQuantities = async (
  tx: Transaction,
  params: UpdateLotQuantitiesParams,
) => {
  const { entry, quantities } = params;
  if (
    quantities.totalQuantity.lt(0) ||
    quantities.allocatedQuantity.lt(0) ||
    quantities.freeQuantity.lt(0)
  ) {
    throw new Error("Quantities cannot be negative");
  }

  const results = await tx
    .insert(schema.inventoryLot)
    .values(
      entry.lots.map((lot) => ({
        componentLotId: lot.id,
        locationId: entry.locationId,
        totalQuantity: quantities.totalQuantity,
        allocatedQuantity: quantities.allocatedQuantity,
        freeQuantity: quantities.freeQuantity,
      })),
    )
    .onConflictDoUpdate({
      target: [
        schema.inventoryLot.componentLotId,
        schema.inventoryLot.locationId,
      ],
      set: {
        totalQuantity: sql.raw(
          `"inventory_lot"."total_quantity" + excluded."total_quantity"`,
        ),
        allocatedQuantity: sql.raw(
          `"inventory_lot"."allocated_quantity" + excluded."allocated_quantity"`,
        ),
        freeQuantity: sql.raw(
          `"inventory_lot"."free_quantity" + excluded."free_quantity"`,
        ),
      },
    })
    .returning();

  const updated = results[0];

  if (!updated) {
    throw new Error("Failed to update lot quantities");
  }

  if (
    updated.freeQuantity.lt(0) ||
    updated.allocatedQuantity.lt(0) ||
    updated.totalQuantity.lt(0)
  ) {
    throw new Error("Invalid lot quantities");
  }

  return updated;
};
