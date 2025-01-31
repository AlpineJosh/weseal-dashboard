import type Decimal from "decimal.js";
import { and, eq, gt, isNull, sql } from "drizzle-orm";

import { schema } from "@repo/db";

import type { Transaction } from "../db";
import { db } from "../db";

const { componentLot, inventoryLot } = schema.base;

async function getLots(
  tx: Transaction,
  {
    componentId,
    batchId,
    locationId,
  }: {
    componentId: string;
    batchId: number | null;
    locationId: number;
    entryDate: Date;
  },
) {
  return await tx
    .select({
      id: inventoryLot.id,
      componentLotId: inventoryLot.componentLotId,
      componentId: componentLot.componentId,
      batchId: componentLot.batchId,
      entryDate: componentLot.entryDate,
      totalQuantity: inventoryLot.totalQuantity,
      freeQuantity: inventoryLot.freeQuantity,
    })
    .from(inventoryLot)
    .leftJoin(componentLot, eq(inventoryLot.componentLotId, componentLot.id))
    .where(
      and(
        eq(componentLot.componentId, componentId),
        eq(inventoryLot.locationId, locationId),
        batchId
          ? eq(componentLot.batchId, batchId)
          : isNull(componentLot.batchId),
        gt(inventoryLot.totalQuantity, 0),
      ),
    )
    .orderBy(componentLot.entryDate)
    .for("update");
}

async function createLot(
  tx: Transaction,
  {
    componentId,
    batchId,
    entryDate = new Date(),
  }: {
    componentId: string;
    batchId: number | null;
    entryDate?: Date;
  },
) {
  return await tx
    .insert(componentLot)
    .values({
      componentId,
      batchId,
      entryDate,
    })
    .returning();
}

async function updateInventoryLot(
  tx: Transaction,
  lotId: number,
  quantity: Decimal,
  isAllocated: boolean,
) {
  return await tx
    .update(inventoryLot)
    .set({
      totalQuantity: sql`total_quantity + ${quantity}`,
      freeQuantity: sql`free_quantity + ${isAllocated ? 0 : quantity}`,
      allocatedQuantity: sql`allocated_quantity + ${isAllocated ? quantity : 0}`,
    })
    .where(eq(inventoryLot.id, lotId))
    .returning();
}

export async function updateInventorySummary(
  tx: Transaction,
  {
    componentId,
    batchId,
    locationId,
    quantityChange,
  }: {
    componentId: string;
    batchId: number | null;
    locationId: number;
    quantityChange: number;
  },
) {
  return await tx
    .update(inventory)
    .set({
      totalQuantity: sql`total_quantity + ${quantityChange}`,
      freeQuantity: sql`free_quantity + ${quantityChange}`,
    })
    .where(
      and(
        eq(inventory.componentId, componentId),
        eq(inventory.locationId, locationId),
        batchId ? eq(inventory.batchId, batchId) : isNull(inventory.batchId),
      ),
    )
    .returning();
}

export async function processInboundMovement(params: SingleLocationMovement) {
  return await db.transaction(async (tx) => {
    const [ledgerEntry] = await tx
      .insert(inventoryLedger)
      .values({
        ...params,
        type: "inbound",
      })
      .returning();

    await createLot(tx, {
      componentId: params.componentId,
      batchId: params.batchId,
      locationId: params.locationId,
      quantity: params.quantity,
    });

    await updateInventorySummary(tx, {
      componentId: params.componentId,
      batchId: params.batchId,
      locationId: params.locationId,
      quantityChange: params.quantity,
    });

    return ledgerEntry;
  });
}

export async function processOutboundMovement(params: SingleLocationMovement) {
  return await db.transaction(async (tx) => {
    const [ledgerEntry] = await tx
      .insert(inventoryLedger)
      .values({
        ...params,
        type: "outbound",
      })
      .returning();

    const lots = await getAvailableLots(tx, {
      componentId: params.componentId,
      batchId: params.batchId,
      locationId: params.locationId,
    });

    let remainingToConsume = Math.abs(params.quantity);

    for (const lot of lots) {
      if (remainingToConsume <= 0) break;

      if (lot.quantity <= remainingToConsume) {
        await updateLotQuantity(tx, lot.id, 0);
        remainingToConsume -= lot.quantity;
      } else {
        await updateLotQuantity(tx, lot.id, lot.quantity - remainingToConsume);
        remainingToConsume = 0;
      }
    }

    if (remainingToConsume > 0) {
      throw new InsufficientInventoryError();
    }

    await updateInventorySummary(tx, {
      componentId: params.componentId,
      batchId: params.batchId,
      locationId: params.locationId,
      quantityChange: -params.quantity,
    });

    return ledgerEntry;
  });
}

export async function processTransferMovement(params: TransferMovement) {
  return await db.transaction(async (tx) => {
    // ... similar pattern to before, but using the utility functions
  });
}
