import type Decimal from "decimal.js";

import { eq, schema } from "@repo/db";

import type { Nullable } from "../../core/types";
import type { Transaction } from "../../db";
import type {
  InventoryEntry,
  InventoryReference,
  LedgerEntryDetails,
} from "../inventory/types";
import { createSalesDespatchItem } from "@/models/despatching/despatch-item";
import { logToLedger } from "@/models/inventory/ledger";
import { createProductionJobAllocation } from "@/models/production/allocation";
import { expectSingleRow } from "../../lib/utils";
import { updateInventory } from "../inventory/inventory";
import { calculateOutboundEntry } from "../inventory/lots";

export interface TaskAllocation {
  reference: InventoryReference;
  quantity: Decimal;
  pickLocationId: number;
  putLocationId: Nullable<number>;
}

export interface CreateTaskAllocationsParams {
  taskId: number;
  allocations: TaskAllocation[];
}

export const createTaskAllocations = async (
  tx: Transaction,
  params: CreateTaskAllocationsParams,
) => {
  const { taskId, allocations } = params;

  return await Promise.all(
    allocations.map((allocation) =>
      createTaskAllocation(tx, {
        taskId,
        ...allocation,
      }),
    ),
  );
};

interface CreateTaskAllocationParams {
  taskId: number;
  reference: InventoryReference;
  quantity: Decimal;
  pickLocationId: number;
  putLocationId: Nullable<number>;
}

const createTaskAllocation = async (
  tx: Transaction,
  params: CreateTaskAllocationParams,
) => {
  const { taskId, reference, quantity, pickLocationId, putLocationId } = params;

  const entry = await calculateOutboundEntry(tx, {
    reference,
    locationId: pickLocationId,
    quantity,
  });

  const taskAllocations = await tx
    .insert(schema.taskAllocation)
    .values({
      taskId,
      componentId: reference.componentId,
      batchId: reference.batchId,
      pickLocationId,
      putLocationId,
      quantity,
    })
    .returning({
      id: schema.taskAllocation.id,
    });

  const taskAllocation = expectSingleRow(
    taskAllocations,
    "Failed to create task allocation",
  );

  return Promise.all([
    updateInventory(tx, { entry, type: "allocation" }),
    tx.insert(schema.taskAllocationLot).values(
      entry.lots.map((lot) => ({
        componentLotId: lot.id,
        taskAllocationId: taskAllocation.id,
        quantity: lot.quantity,
      })),
    ),
  ]);
};

interface CompleteTaskAllocationParams {
  taskAllocationId: number;
  userId: string;
}

export const completeTaskAllocation = async (
  tx: Transaction,
  params: CompleteTaskAllocationParams,
) => {
  const { taskAllocationId, userId } = params;

  const allocation = await tx.query.taskAllocation.findFirst({
    where: eq(schema.taskAllocation.id, taskAllocationId),
    with: {
      task: true,
    },
  });

  if (!allocation) {
    throw new Error(`Task allocation ${taskAllocationId} not found`);
  }

  if (allocation.isComplete) {
    throw new Error(`Task allocation ${taskAllocationId} is already completed`);
  }

  if (allocation.task.isCancelled) {
    throw new Error(
      `Cannot complete allocation for cancelled task ${allocation.task.id}`,
    );
  }

  // Update completion status first to prevent race conditions
  const updated = await tx
    .update(schema.taskAllocation)
    .set({ isComplete: true })
    .where(eq(schema.taskAllocation.id, taskAllocationId))
    .returning({ id: schema.taskAllocation.id });

  if (!updated.length) {
    throw new Error(
      `Failed to mark task allocation ${taskAllocationId} as complete`,
    );
  }

  const allocationLots = await tx
    .delete(schema.taskAllocationLot)
    .where(eq(schema.taskAllocationLot.taskAllocationId, allocation.id))
    .returning({
      id: schema.taskAllocationLot.id,
      componentLotId: schema.taskAllocationLot.componentLotId,
      quantity: schema.taskAllocationLot.quantity,
    });

  const reference: InventoryReference = {
    componentId: allocation.componentId,
    batchId: allocation.batchId,
  };

  const entry: Omit<InventoryEntry, "locationId"> = {
    reference,
    quantity: allocation.quantity,
    lots: allocationLots.map((lot) => ({
      id: lot.componentLotId,
      quantity: lot.quantity,
    })),
  };

  const details: LedgerEntryDetails = {
    userId,
    type: allocation.task.type,
  };

  if (allocation.task.type === "despatch") {
    if (!allocation.task.salesDespatchId) {
      throw new Error("Despatch task has no sales despatch id");
    }

    details.salesDespatchItemId = await createSalesDespatchItem(tx, {
      despatchId: allocation.task.salesDespatchId,
      reference,
      quantity: allocation.quantity,
    });
  }

  if (allocation.task.type === "production") {
    if (!allocation.task.productionJobId || !allocation.putLocationId) {
      throw new Error(
        "Production task has no production job id or put location id",
      );
    }

    details.productionJobAllocationId = await createProductionJobAllocation(
      tx,
      {
        productionJobId: allocation.task.productionJobId,
        entry: {
          ...entry,
          locationId: allocation.putLocationId,
        },
      },
    );
  }

  await updateInventory(tx, {
    entry: { locationId: allocation.pickLocationId, ...entry },
    type: "deallocation",
  });

  await updateInventory(tx, {
    entry: { locationId: allocation.pickLocationId, ...entry },
    type: "outbound",
  });

  await logToLedger(tx, {
    direction: "outbound",
    entry: { locationId: allocation.pickLocationId, ...entry },
    details,
  });

  if (allocation.putLocationId) {
    await updateInventory(tx, {
      entry: { locationId: allocation.putLocationId, ...entry },
      type: "inbound",
    });
    await logToLedger(tx, {
      direction: "inbound",
      entry: { locationId: allocation.putLocationId, ...entry },
      details,
    });

    if (allocation.task.type === "production") {
      await updateInventory(tx, {
        entry: { locationId: allocation.putLocationId, ...entry },
        type: "allocation",
      });
    }
  }

  return allocationLots;
};
