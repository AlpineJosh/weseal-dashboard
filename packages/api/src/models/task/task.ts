import { eq, schema } from "@repo/db";

import type { Transaction } from "../../db";
import type { InventoryEntry } from "../inventory/types";
import type { TaskAllocation } from "./allocation";
import { expectSingleRow } from "../../lib/utils";
import { updateInventory } from "../inventory/inventory";
import { createTaskAllocations } from "./allocation";

interface CreateTaskParams {
  type: "despatch" | "production" | "transfer";
  assignedToId: string;
  createdById: string;
  salesDespatchId?: number;
  productionJobId?: number;
  allocations: TaskAllocation[];
}

export const createTask = async (tx: Transaction, params: CreateTaskParams) => {
  const { allocations, ...details } = params;

  const task = await createTaskRecord(tx, details);

  await createTaskAllocations(tx, {
    taskId: task.id,
    allocations,
  });

  return task;
};

interface CreateTaskRecordParams {
  type: "despatch" | "production" | "transfer";
  assignedToId: string;
  createdById: string;
}

const createTaskRecord = async (
  tx: Transaction,
  details: CreateTaskRecordParams,
) => {
  const tasks = await tx.insert(schema.task).values(details).returning({
    id: schema.task.id,
  });

  const task = expectSingleRow(tasks, "Failed to create task");

  return task;
};

export const cancelTask = async (tx: Transaction, taskId: number) => {
  const task = await tx.query.task.findFirst({
    where: eq(schema.task.id, taskId),
  });

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  if (task.isCancelled) {
    throw new Error(`Task ${taskId} is already cancelled`);
  }

  const allocations = await tx.query.taskAllocation.findMany({
    where: eq(schema.taskAllocation.taskId, taskId),
  });

  const promises = allocations.map(async (allocation) => {
    if (allocation.isComplete) {
      return;
    }

    const allocationLots = await tx
      .delete(schema.taskAllocationLot)
      .where(eq(schema.taskAllocationLot.taskAllocationId, allocation.id))
      .returning({
        id: schema.taskAllocationLot.id,
        componentLotId: schema.taskAllocationLot.componentLotId,
        quantity: schema.taskAllocationLot.quantity,
      });

    const entry: InventoryEntry = {
      reference: {
        componentId: allocation.componentId,
        batchId: allocation.batchId,
      },
      locationId: allocation.pickLocationId,
      quantity: allocation.quantity,
      lots: allocationLots.map((lot) => ({
        id: lot.componentLotId,
        quantity: lot.quantity,
      })),
    };

    await updateInventory(tx, {
      entry,
      type: "deallocation",
    });
  });

  await Promise.all(promises);

  await tx
    .update(schema.task)
    .set({ isCancelled: true })
    .where(eq(schema.task.id, taskId));
};
