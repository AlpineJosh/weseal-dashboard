import type Decimal from "decimal.js";

import { eq, schema } from "@repo/db";

import type { Nullable } from "../../core/types";
import type { Transaction } from "../../db";
import type { InventoryReference } from "../inventory/types";
import type { TaskAllocation } from "@/models/task/allocation";
import { createTask } from "@/models/task/task";
import { expectSingleRow } from "../../lib/utils";
import { getSubcomponents } from "../component/component";
import { updateInventory } from "../inventory/inventory";
import { logToLedger } from "../inventory/ledger";
import { createInboundEntry } from "../inventory/lots";
import { consumeSubcomponent, handleRemainingAllocations } from "./allocation";

interface CreateProductionJobTaskParams {
  userId: string;
  componentId: string;
  batchReference: Nullable<string>;
  outputLocationId: number;
  targetQuantity: Decimal;
  assignedToId: string;
  allocations: TaskAllocation[];
}

export const createProductionJobTask = async (
  tx: Transaction,
  params: CreateProductionJobTaskParams,
) => {
  let batchId: number | undefined;
  if (params.batchReference) {
    const batches = await tx
      .insert(schema.batch)
      .values({
        batchReference: params.batchReference,
        componentId: params.componentId,
      })
      .onConflictDoNothing()
      .returning();
    const batch = expectSingleRow(batches, "Failed to create batch");
    batchId = batch.id;
  }

  const jobs = await tx
    .insert(schema.productionJob)
    .values({
      componentId: params.componentId,
      batchId,
      outputLocationId: params.outputLocationId,
      targetQuantity: params.targetQuantity,
    })
    .returning();

  const job = expectSingleRow(jobs, "Failed to create production job");

  return await createTask(tx, {
    type: "production",
    productionJobId: job.id,
    assignedToId: params.assignedToId,
    createdById: params.userId,
    allocations: params.allocations,
  });
};

interface AddToProductionJobParams {
  id: number;
  allocations: TaskAllocation[];
  assignedToId: string;
  userId: string;
}

export const addToProductionJob = async (
  tx: Transaction,
  params: AddToProductionJobParams,
) => {
  const { id, allocations, assignedToId } = params;

  //Check if the job exists
  const job = await tx.query.productionJob.findFirst({
    where: eq(schema.productionJob.id, id),
  });

  if (!job) {
    throw new Error("Production job not found");
  }

  await createTask(tx, {
    type: "production",
    productionJobId: job.id,
    assignedToId,
    createdById: params.userId,
    allocations,
  });
};

interface ProcessProductionOutParams {
  id: number;
  quantity: Decimal;
  userId: string;
}

export const processProductionOut = async (
  tx: Transaction,
  params: ProcessProductionOutParams,
) => {
  const { id, quantity, userId } = params;

  const jobs = await tx
    .select()
    .from(schema.productionJob)
    .where(eq(schema.productionJob.id, id));
  const job = expectSingleRow(jobs, "Production job not found");

  const reference = {
    componentId: job.componentId,
    batchId: job.batchId,
  };

  await consumeSubcomponents(tx, {
    jobId: job.id,
    reference,
    quantity,
    userId,
  });
  await createProductionOutput(tx, {
    jobId: job.id,
    reference,
    locationId: job.outputLocationId,
    quantity,
    userId,
  });
};

interface ConsumeSubcomponentsParams {
  jobId: number;
  reference: InventoryReference;
  quantity: Decimal;
  userId: string;
}

const consumeSubcomponents = async (
  tx: Transaction,
  params: ConsumeSubcomponentsParams,
) => {
  const { jobId, reference, quantity, userId } = params;

  const subcomponents = await getSubcomponents(tx, reference.componentId);

  for (const subcomponent of subcomponents) {
    await consumeSubcomponent(tx, {
      jobId,
      componentId: subcomponent.subcomponentId,
      quantity: quantity.mul(subcomponent.quantity),
      userId,
    });
  }
};

interface CreateProductionOutputParams {
  jobId: number;
  reference: InventoryReference;
  locationId: number;
  quantity: Decimal;
  userId: string;
}

const createProductionOutput = async (
  tx: Transaction,
  params: CreateProductionOutputParams,
) => {
  const { jobId, reference, locationId, quantity, userId } = params;

  const entry = await createInboundEntry(tx, {
    reference,
    locationId,
    quantity,
    entryDate: new Date(),
    source: {
      type: "production",
      productionJobId: jobId,
    },
  });

  await updateInventory(tx, { entry, type: "inbound" });
  await logToLedger(tx, {
    direction: "inbound",
    entry,
    details: {
      userId,
      type: "production",
    },
  });
};

interface RemainingQuantity {
  reference: InventoryReference;
  quantity: Decimal;
}

// For completeProductionJob:
interface CompleteProductionJobParams {
  id: number;
  remainingQuantities: RemainingQuantity[];
  userId: string;
}

export const completeProductionJob = async (
  tx: Transaction,
  params: CompleteProductionJobParams,
) => {
  const { id, remainingQuantities, userId } = params;

  await handleRemainingAllocations(tx, {
    jobId: id,
    remainingQuantities,
    userId,
  });

  await tx
    .update(schema.productionJob)
    .set({
      isComplete: true,
    })
    .where(eq(schema.productionJob.id, id));
};
