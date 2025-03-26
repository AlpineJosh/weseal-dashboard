import type { Transaction } from "#db";
import type {
  InventoryEntry,
  InventoryLotEntry,
  InventoryReference,
} from "#models/inventory/types";
import { expectSingleRow } from "#lib/utils";
import { updateInventory } from "#models/inventory/inventory";
import { logToLedger } from "#models/inventory/ledger";
import { Decimal } from "decimal.js";

import { and, asc, eq, schema, sql } from "@repo/db";

export interface CreateProductionJobAllocationParams {
  productionJobId: number;
  entry: InventoryEntry;
}

export const createProductionJobAllocation = async (
  tx: Transaction,
  params: CreateProductionJobAllocationParams,
) => {
  const { productionJobId, entry } = params;

  const productionJobAllocations = await tx
    .insert(schema.productionJobAllocation)
    .values({
      productionJobId: productionJobId,
      componentId: entry.reference.componentId,
      batchId: entry.reference.batchId,
      locationId: entry.locationId,
      totalQuantity: entry.quantity,
      remainingQuantity: entry.quantity,
      usedQuantity: new Decimal(0),
    })
    .returning({
      id: schema.productionJobAllocation.id,
    });

  const productionJobAllocation = productionJobAllocations[0];
  if (!productionJobAllocation) {
    throw new Error("Failed to create production job allocation");
  }

  await tx.insert(schema.productionJobAllocationLot).values(
    entry.lots.map((lot) => ({
      productionJobAllocationId: productionJobAllocation.id,
      componentLotId: lot.id,
      quantity: lot.quantity,
    })),
  );

  return productionJobAllocation.id;
};

interface ConsumeAllocationParams {
  jobId: number;
  componentId: string;
  quantity: Decimal;
  userId: string;
}

export const consumeSubcomponent = async (
  tx: Transaction,
  params: ConsumeAllocationParams,
) => {
  const { jobId, componentId, quantity, userId } = params;

  const allocations = await tx
    .select({
      id: schema.productionJobAllocation.id,
      componentId: schema.productionJobAllocation.componentId,
      batchId: schema.productionJobAllocation.batchId,
      locationId: schema.productionJobAllocation.locationId,
      remainingQuantity: schema.productionJobAllocation.remainingQuantity,
      usedQuantity: schema.productionJobAllocation.usedQuantity,
      totalQuantity: schema.productionJobAllocation.totalQuantity,
    })
    .from(schema.productionJobAllocation)
    .where(
      and(
        eq(schema.productionJobAllocation.componentId, componentId),
        eq(schema.productionJobAllocation.productionJobId, jobId),
      ),
    );
  let remaining = quantity;

  for (const allocation of allocations) {
    if (remaining.lte(0)) break;

    const lots = await getAllocationLots(tx, allocation.id);
    const quantityUsed = Decimal.min(allocation.remainingQuantity, remaining);
    const usedLots = calculateLotUsage(
      lots.map((lot) => ({
        id: lot.componentLotId,
        quantity: lot.quantity,
      })),
      quantityUsed,
    );

    await updateAllocationQuantities(tx, {
      allocationId: allocation.id,
      quantityUsed,
    });

    const entry: InventoryEntry = {
      reference: {
        componentId: allocation.componentId,
        batchId: allocation.batchId,
      },
      locationId: allocation.locationId,
      quantity: quantityUsed,
      lots: usedLots,
    };

    await processSubcomponentConsumption(tx, {
      allocationId: allocation.id,
      entry,
      userId,
    });

    remaining = remaining.sub(quantityUsed);

    if (remaining.lte(0)) {
      break;
    }
  }
};

const getAllocationLots = async (tx: Transaction, allocationId: number) => {
  return tx
    .select({
      componentLotId: schema.productionJobAllocationLot.componentLotId,
      quantity: schema.productionJobAllocationLot.quantity,
    })
    .from(schema.productionJobAllocationLot)
    .where(
      eq(
        schema.productionJobAllocationLot.productionJobAllocationId,
        allocationId,
      ),
    )
    .orderBy(asc(schema.productionJobAllocationLot.componentLotId));
};

const calculateLotUsage = (lots: InventoryLotEntry[], quantity: Decimal) => {
  let remainingToUse = quantity;
  const usedLots: InventoryLotEntry[] = [];

  // Use up lots one by one until we have enough quantity
  for (const lot of lots) {
    if (remainingToUse.lte(0)) break;

    const useFromLot = Decimal.min(lot.quantity, remainingToUse);
    usedLots.push({
      id: lot.id,
      quantity: useFromLot,
    });
    remainingToUse = remainingToUse.sub(useFromLot);
  }

  return usedLots;
};

interface UpdateAllocationQuantitiesParams {
  allocationId: number;
  quantityUsed: Decimal;
}

const updateAllocationQuantities = async (
  tx: Transaction,
  params: UpdateAllocationQuantitiesParams,
) => {
  const { allocationId, quantityUsed } = params;

  const results = await tx
    .update(schema.productionJobAllocation)
    .set({
      remainingQuantity: sql`${schema.productionJobAllocation.remainingQuantity} - ${quantityUsed}`,
      usedQuantity: sql`${schema.productionJobAllocation.usedQuantity} + ${quantityUsed}`,
    })
    .where(eq(schema.productionJobAllocation.id, allocationId))
    .returning();

  const result = expectSingleRow(results, "Allocation not found");

  if (
    result.remainingQuantity.lte(0) ||
    result.usedQuantity.gt(result.totalQuantity)
  ) {
    throw new Error("Can't use more than the total quantity");
  }
};

interface ProcessSubcomponentConsumptionParams {
  allocationId: number;
  entry: InventoryEntry;
  userId: string;
}

const processSubcomponentConsumption = async (
  tx: Transaction,
  params: ProcessSubcomponentConsumptionParams,
) => {
  const { allocationId, entry, userId } = params;

  await updateInventory(tx, { entry, type: "deallocation" });
  await updateInventory(tx, { entry, type: "outbound" });
  await logToLedger(tx, {
    direction: "outbound",
    entry,
    details: {
      userId,
      type: "production",
      productionJobAllocationId: allocationId,
    },
  });
};

interface RemainingQuantity {
  reference: InventoryReference;
  quantity: Decimal;
}

interface ReinistateSubcomponentParams {
  jobId: number;
  componentId: string;
  quantity: Decimal;
  userId: string;
}

export const reinistateSubcomponent = async (
  tx: Transaction,
  params: ReinistateSubcomponentParams,
) => {
  const { jobId, componentId, quantity, userId } = params;

  const allocations = await tx
    .select({
      id: schema.productionJobAllocation.id,
      componentId: schema.productionJobAllocation.componentId,
      batchId: schema.productionJobAllocation.batchId,
      locationId: schema.productionJobAllocation.locationId,
      remainingQuantity: schema.productionJobAllocation.remainingQuantity,
      usedQuantity: schema.productionJobAllocation.usedQuantity,
      totalQuantity: schema.productionJobAllocation.totalQuantity,
    })
    .from(schema.productionJobAllocation)
    .where(
      and(
        eq(schema.productionJobAllocation.componentId, componentId),
        eq(schema.productionJobAllocation.productionJobId, jobId),
      ),
    );

  let remaining = quantity;

  for (const allocation of allocations) {
    if (remaining.lte(0)) break;

    const lots = await getAllocationLots(tx, allocation.id);
    const quantityToReinstate = Decimal.min(allocation.usedQuantity, remaining);
    const lotsToReinstate = calculateLotUsage(
      lots.map((lot) => ({
        id: lot.componentLotId,
        quantity: lot.quantity,
      })),
      quantityToReinstate,
    );

    // Update allocation quantities
    await tx
      .update(schema.productionJobAllocation)
      .set({
        remainingQuantity: sql`${schema.productionJobAllocation.remainingQuantity} + ${quantityToReinstate}`,
        usedQuantity: sql`${schema.productionJobAllocation.usedQuantity} - ${quantityToReinstate}`,
      })
      .where(eq(schema.productionJobAllocation.id, allocation.id));

    const entry: InventoryEntry = {
      reference: {
        componentId: allocation.componentId,
        batchId: allocation.batchId,
      },
      locationId: allocation.locationId,
      quantity: quantityToReinstate,
      lots: lotsToReinstate,
    };

    // Return to inventory
    await updateInventory(tx, { entry, type: "inbound" });
    await logToLedger(tx, {
      direction: "inbound",
      entry,
      details: {
        userId,
        type: "production",
        productionJobAllocationId: allocation.id,
      },
    });

    remaining = remaining.sub(quantityToReinstate);
  }

  if (remaining.gt(0)) {
    throw new Error("Failed to reinstate full quantity");
  }
};

interface HandleRemainingAllocationsParams {
  jobId: number;
  remainingQuantities: RemainingQuantity[];
  userId: string;
}

export const handleRemainingAllocations = async (
  tx: Transaction,
  params: HandleRemainingAllocationsParams,
) => {
  const { jobId, remainingQuantities, userId } = params;

  const allocations = await tx.query.productionJobAllocation.findMany({
    where: eq(schema.productionJobAllocation.productionJobId, jobId),
  });

  for (const allocation of allocations) {
    const remaining =
      remainingQuantities.find(
        (remainingQuantity) =>
          remainingQuantity.reference.componentId === allocation.componentId &&
          remainingQuantity.reference.batchId === allocation.batchId,
      )?.quantity ?? allocation.remainingQuantity;

    if (allocation.remainingQuantity.lt(remaining)) {
      throw new Error("There isn't enough remaining quantity");
    }

    const difference = remaining.sub(allocation.remainingQuantity);

    if (difference.lt(0)) {
      await consumeSubcomponent(tx, {
        jobId,
        componentId: allocation.componentId,
        quantity: remaining,
        userId,
      });
    } else if (difference.gt(0)) {
      await reinistateSubcomponent(tx, {
        jobId,
        componentId: allocation.componentId,
        quantity: remaining,
        userId,
      });
    }

    // 2. Release any remaining allocation
    if (remaining.gt(0)) {
      const lots = await getAllocationLots(tx, allocation.id);

      const entry: InventoryEntry = {
        reference: {
          componentId: allocation.componentId,
          batchId: allocation.batchId,
        },
        locationId: allocation.locationId,
        quantity: remaining,
        lots: lots.map((lot) => ({
          id: lot.componentLotId,
          quantity: lot.quantity,
        })),
      };

      // Release the allocation
      await updateInventory(tx, {
        entry,
        type: "deallocation",
      });
    }
  }
};
