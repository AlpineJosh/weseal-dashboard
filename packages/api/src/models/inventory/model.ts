import Decimal from "decimal.js";

import type { Schema } from "@repo/db";
import { and, asc, desc, eq, gt, schema, sql } from "@repo/db";

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

  if (entry.quantity.lt(0)) {
    throw new Error("Quantity must be greater than 0");
  }

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
        return quantity.negated();
      case "deallocation":
        return quantity;
    }
  };

  console.log(entry);
  console.log(getTotal(entry.quantity));
  console.log(getAllocated(entry.quantity));
  console.log(getFree(entry.quantity));

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

export const allocateToTask = async (
  tx: Transaction,
  reference: InventoryReference,
  quantity: Decimal,
  taskId: number,
  pickLocationId: number,
  putLocationId?: number,
) => {
  const entry = await calculateOutboundEntry(
    tx,
    reference,
    pickLocationId,
    quantity,
  );

  const allocations = await tx
    .insert(schema.taskAllocation)
    .values({
      componentId: entry.componentId,
      batchId: entry.batchId,
      pickLocationId: pickLocationId,
      putLocationId: putLocationId,
      quantity: entry.quantity,
      taskId: taskId,
    })
    .returning();

  const allocation = allocations[0];

  if (!allocation) {
    throw new Error("Failed to create production job allocation");
  }

  await tx.insert(schema.taskAllocationLot).values(
    entry.lots.map((lot) => ({
      componentLotId: lot.id,
      taskAllocationId: allocation.id,
      quantity: lot.quantity,
    })),
  );

  await updateInventory(tx, entry, "allocation");
};

export const completeTaskAllocation = async (
  tx: Transaction,
  taskAllocationId: number,
  userId: string,
) => {
  const allocations = await tx
    .select({
      componentId: schema.taskAllocation.componentId,
      batchId: schema.taskAllocation.batchId,
      pickLocationId: schema.taskAllocation.pickLocationId,
      putLocationId: schema.taskAllocation.putLocationId,
      quantity: schema.taskAllocation.quantity,
      taskId: schema.taskAllocation.taskId,
      type: schema.task.type,
      productionJobId: schema.task.productionJobId,
      salesDespatchId: schema.task.salesDespatchId,
    })
    .from(schema.taskAllocation)
    .where(eq(schema.taskAllocation.id, taskAllocationId))
    .leftJoin(schema.task, eq(schema.taskAllocation.taskId, schema.task.id))
    .limit(1);

  const allocation = allocations[0];

  if (!allocation?.type) {
    throw new Error("Task allocation not found");
  }

  const allocationLots = await tx
    .select()
    .from(schema.taskAllocationLot)
    .where(eq(schema.taskAllocationLot.taskAllocationId, taskAllocationId));

  const entry = {
    componentId: allocation.componentId,
    batchId: allocation.batchId ?? undefined,
    quantity: allocation.quantity,
    lots: allocationLots,
  };

  const details: LedgerEntryDetails = {
    userId,
    type: allocation.type,
  };

  if (allocation.salesDespatchId) {
    const salesDespatchItem = await tx
      .insert(schema.salesDespatchItem)
      .values({
        despatchId: allocation.salesDespatchId,
        componentId: entry.componentId,
        batchId: entry.batchId,
        quantity: entry.quantity,
      })
      .returning({
        id: schema.salesDespatchItem.id,
      });

    details.salesDespatchItemId = salesDespatchItem[0]?.id;
  }

  if (allocation.productionJobId && allocation.putLocationId) {
    const productionAllocations = await tx
      .insert(schema.productionJobAllocation)
      .values({
        componentId: entry.componentId,
        batchId: entry.batchId,
        locationId: allocation.putLocationId,
        totalQuantity: entry.quantity,
        remainingQuantity: entry.quantity,
        usedQuantity: new Decimal(0),
        productionJobId: allocation.productionJobId,
      })
      .returning();

    const productionAllocation = productionAllocations[0];

    if (!productionAllocation) {
      throw new Error("Failed to create production job allocation");
    }

    await tx.insert(schema.productionJobAllocationLot).values(
      entry.lots.map((lot) => ({
        componentLotId: lot.id,
        productionJobAllocationId: productionAllocation.id,
        quantity: lot.quantity,
      })),
    );

    await updateInventory(
      tx,
      {
        ...entry,
        locationId: allocation.putLocationId,
      },
      "allocation",
    );

    details.productionJobAllocationId = productionAllocation.id;
  }

  await tx
    .update(schema.taskAllocation)
    .set({
      isComplete: true,
    })
    .where(eq(schema.taskAllocation.id, taskAllocationId));

  await updateInventory(
    tx,
    {
      ...entry,
      locationId: allocation.pickLocationId,
    },
    "deallocation",
  );

  await updateInventory(
    tx,
    {
      ...entry,
      locationId: allocation.pickLocationId,
    },
    "outbound",
  );
  await logToLedger(
    tx,
    "outbound",
    {
      ...entry,
      locationId: allocation.pickLocationId,
    },
    details,
  );

  if (allocation.putLocationId) {
    await updateInventory(
      tx,
      {
        ...entry,
        locationId: allocation.putLocationId,
      },
      "inbound",
    );

    await logToLedger(
      tx,
      "inbound",
      {
        ...entry,
        locationId: allocation.putLocationId,
      },
      details,
    );
  }
};

export const processProductionOut = async (
  tx: Transaction,
  productionJobId: number,
  quantity: Decimal,
  userId: string,
) => {
  const jobs = await tx
    .select()
    .from(schema.productionJob)
    .where(eq(schema.productionJob.id, productionJobId))
    .limit(1);

  const job = jobs[0];

  if (!job) {
    throw new Error("Production job not found");
  }

  const wip = await tx.query.component.findFirst({
    where: eq(schema.component.id, `${job.componentId}WIP`),
  });

  const componentId = wip ? wip.id : job.componentId;

  const subcomponents = await tx
    .select()
    .from(schema.subcomponent)
    .where(eq(schema.subcomponent.componentId, componentId));

  for (const subcomponent of subcomponents) {
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
          eq(
            schema.productionJobAllocation.componentId,
            subcomponent.subcomponentId,
          ),
          eq(schema.productionJobAllocation.productionJobId, productionJobId),
        ),
      );

    let requiredQuantity = quantity.mul(subcomponent.quantity);

    for (const allocation of allocations) {
      // Get the lots for this allocation ordered by componentLotId (FIFO)
      const lots = await tx
        .select()
        .from(schema.productionJobAllocationLot)
        .where(
          eq(
            schema.productionJobAllocationLot.productionJobAllocationId,
            allocation.id,
          ),
        )
        .orderBy(asc(schema.productionJobAllocationLot.componentLotId));

      let remainingToUse = Decimal.min(
        allocation.remainingQuantity,
        requiredQuantity,
      );
      const usedLots: { id: number; quantity: Decimal }[] = [];

      // Use up lots one by one until we have enough quantity
      for (const lot of lots) {
        if (remainingToUse.lte(0)) break;

        const useFromLot = Decimal.min(lot.quantity, remainingToUse);
        usedLots.push({
          id: lot.componentLotId,
          quantity: useFromLot,
        });
        remainingToUse = remainingToUse.sub(useFromLot);
      }

      const useQuantity = requiredQuantity.sub(remainingToUse);

      const entry: InventoryEntry = {
        componentId: allocation.componentId,
        batchId: allocation.batchId ?? undefined,
        locationId: allocation.locationId,
        quantity: useQuantity,
        lots: usedLots,
      };

      // Update the allocation's remaining quantity
      await tx
        .update(schema.productionJobAllocation)
        .set({
          remainingQuantity: allocation.remainingQuantity.sub(useQuantity),
          usedQuantity: allocation.usedQuantity.add(useQuantity),
        })
        .where(eq(schema.productionJobAllocation.id, allocation.id));

      // Process the inventory movements
      await updateInventory(tx, entry, "deallocation");
      await updateInventory(tx, entry, "outbound");
      await logToLedger(tx, "outbound", entry, {
        userId,
        type: "production",
        productionJobAllocationId: allocation.id,
      });

      requiredQuantity = requiredQuantity.sub(useQuantity);
      if (requiredQuantity.lte(0)) {
        break;
      }
    }
  }

  const entry = await createInboundEntry(
    tx,
    {
      componentId: job.componentId,
      batchId: job.batchId ?? undefined,
    },
    job.outputLocationId,
    quantity,
    new Date(),
    undefined,
    productionJobId,
  );

  await updateInventory(tx, entry, "inbound");
  await logToLedger(tx, "inbound", entry, {
    userId,
    type: "production",
  });
};

export const adjustInventory = async (
  tx: Transaction,
  reference: InventoryReference,
  locationId: number,
  quantity: Decimal,
  type: "correction" | "wastage" | "lost" | "found",
  userId: string,
) => {
  let entry;
  if (quantity.gt(0)) {
    entry = await calculateOutboundEntry(tx, reference, locationId, quantity);
    await updateInventory(tx, entry, "outbound");
    await logToLedger(tx, "outbound", entry, {
      userId,
      type,
    });
  } else {
    entry = await assignInboundEntry(tx, reference, locationId, quantity);
    await updateInventory(tx, entry, "inbound");
    await logToLedger(tx, "inbound", entry, {
      userId,
      type,
    });
  }
};

export const processReceipt = async (
  tx: Transaction,
  reference: InventoryReference,
  locationId: number,
  quantity: Decimal,
  entryDate: Date,
  purchaseReceiptItemId: number,
  userId: string,
) => {
  const entry = await createInboundEntry(
    tx,
    reference,
    locationId,
    quantity,
    entryDate,
    purchaseReceiptItemId,
  );

  await updateInventory(tx, entry, "inbound");
  await logToLedger(tx, "inbound", entry, {
    userId,
    type: "receipt",
  });
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
