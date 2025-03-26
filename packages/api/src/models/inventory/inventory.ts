import Decimal from "decimal.js";
import { and, eq, isNull, sql } from "drizzle-orm";

import { schema } from "@repo/db";

import type {
  InventoryEntry,
  InventoryOperationType,
  InventoryQuantities,
  InventoryReference,
} from "./types";
import type { Transaction } from "@/db";
import type { TaskAllocation } from "@/models/task/allocation";
import { expectSingleRow } from "@/lib/utils";
import { createTask } from "@/models/task/task";
import { logToLedger } from "./ledger";
import {
  assignInboundEntry,
  calculateOutboundEntry,
  updateLotQuantities,
} from "./lots";

interface CalculateQuantityChangesParams {
  quantity: Decimal;
  type: InventoryOperationType;
}

export const calculateQuantityChanges = (
  params: CalculateQuantityChangesParams,
): InventoryQuantities => {
  const { quantity, type } = params;

  switch (type) {
    case "inbound":
      return {
        totalQuantity: quantity,
        allocatedQuantity: new Decimal(0),
        freeQuantity: quantity,
      };
    case "outbound":
      return {
        totalQuantity: quantity.negated(),
        allocatedQuantity: new Decimal(0),
        freeQuantity: quantity.negated(),
      };
    case "allocation":
      return {
        totalQuantity: new Decimal(0),
        allocatedQuantity: quantity,
        freeQuantity: quantity.negated(),
      };
    case "deallocation":
      return {
        totalQuantity: new Decimal(0),
        allocatedQuantity: quantity.negated(),
        freeQuantity: quantity,
      };
  }
};

interface UpdateInventoryQuantitiesParams {
  reference: InventoryReference;
  locationId: number;
  quantities: InventoryQuantities;
}

export const updateInventoryQuantities = async (
  tx: Transaction,
  params: UpdateInventoryQuantitiesParams,
) => {
  const { reference, locationId, quantities } = params;

  const results = await tx
    .insert(schema.inventory)
    .values({
      componentId: reference.componentId,
      batchId: reference.batchId,
      locationId,
      ...quantities,
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
          `"inventory"."total_quantity" + excluded."total_quantity"`,
        ),
        allocatedQuantity: sql.raw(
          `"inventory"."allocated_quantity" + excluded."allocated_quantity"`,
        ),
        freeQuantity: sql.raw(
          `"inventory"."free_quantity" + excluded."free_quantity"`,
        ),
      },
    })
    .returning();

  const updated = expectSingleRow(results, "Update inventory quantities");

  if (
    updated.totalQuantity.lt(0) ||
    updated.allocatedQuantity.lt(0) ||
    updated.freeQuantity.lt(0)
  ) {
    throw new Error("Operation would result in negative quantities");
  }

  return updated;
};

interface UpdateInventoryParams {
  entry: InventoryEntry;
  type: InventoryOperationType;
}

export const updateInventory = async (
  tx: Transaction,
  params: UpdateInventoryParams,
) => {
  const { entry, type } = params;

  if (entry.quantity.lt(0)) {
    throw new Error("Quantity must be greater than 0");
  }

  const quantities = calculateQuantityChanges({
    quantity: entry.quantity,
    type,
  });

  await Promise.all([
    updateInventoryQuantities(tx, {
      reference: entry.reference,
      locationId: entry.locationId,
      quantities,
    }),

    updateLotQuantities(tx, {
      entry,
      quantities,
    }),
  ]);
};

interface AdjustInventoryParams {
  reference: InventoryReference;
  locationId: number;
  quantity: Decimal;
  userId: string;
  type: "correction" | "found" | "lost" | "wastage";
}

export const adjustInventory = async (
  tx: Transaction,
  params: AdjustInventoryParams,
) => {
  const { reference, locationId, quantity, ...details } = params;

  const current = await tx
    .select({
      freeQuantity: schema.inventory.freeQuantity,
    })
    .from(schema.inventory)
    .where(
      and(
        eq(schema.inventory.componentId, reference.componentId),
        eq(schema.inventory.locationId, locationId),
        reference.batchId
          ? eq(schema.inventory.batchId, reference.batchId)
          : isNull(schema.inventory.batchId),
      ),
    )
    .limit(1);

  const currentQuantity = current[0]?.freeQuantity ?? new Decimal(0);
  const difference = quantity.sub(currentQuantity);

  if (difference.eq(0)) return;

  let entry;
  if (difference.lt(0)) {
    entry = await calculateOutboundEntry(tx, {
      reference,
      locationId,
      quantity: difference.abs(),
    });
    await updateInventory(tx, { entry, type: "outbound" });
    await logToLedger(tx, {
      direction: "outbound",
      entry,
      details,
    });
  } else {
    entry = await assignInboundEntry(tx, {
      reference,
      locationId,
      quantity: difference.abs(),
    });
    await updateInventory(tx, { entry, type: "inbound" });
    await logToLedger(tx, {
      direction: "inbound",
      entry,
      details,
    });
  }
};

interface CreateTransferTaskParams {
  assignedToId: string;
  createdById: string;
  allocations: TaskAllocation[];
}

export const createTransferTask = async (
  tx: Transaction,
  params: CreateTransferTaskParams,
) => {
  return await createTask(tx, {
    type: "transfer",
    ...params,
  });
};
