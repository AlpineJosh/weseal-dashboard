import type { Transaction } from "#db";
import type { TaskAllocation } from "#models/task/allocation";
import { expectSingleRow } from "#lib/utils";
import { createTask } from "#models/task/task";

import { schema } from "@repo/db";

export interface CreateDespatchTaskParams {
  orderId: number;
  assignedToId: string;
  createdById: string;
  allocations: Omit<TaskAllocation, "putLocationId">[];
}

export const createDespatchTask = async (
  tx: Transaction,
  { orderId, ...taskDetails }: CreateDespatchTaskParams,
) => {
  const despatches = await tx
    .insert(schema.salesDespatch)
    .values({
      orderId,
      despatchDate: new Date(),
    })
    .returning({
      id: schema.salesDespatch.id,
    });

  const despatch = expectSingleRow(despatches, "Failed to create despatch");

  return await createTask(tx, {
    ...taskDetails,
    type: "despatch",
    salesDespatchId: despatch.id,
    allocations: taskDetails.allocations.map((allocation) => ({
      ...allocation,
      putLocationId: null,
    })),
  });
};
