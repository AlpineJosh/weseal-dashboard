import { Decimal } from "decimal.js";

import { aliasedTable, eq, schema, sql } from "@repo/db";

import type { Transaction } from "../../db";
import type { InventoryEntry, LedgerEntryDetails } from "../inventory/model";
import { db } from "../../db";
import { datatable } from "../../lib/datatables";
import { coalesce } from "../../lib/operators";
import {
  calculateOutboundEntry,
  logToLedger,
  updateInventory,
} from "../inventory/model";

// First create a subquery for task items aggregation
const taskAllocationsAggregation = db
  .select({
    taskId: schema.taskAllocation.taskId,
    itemCount: sql<number>`count(${schema.taskAllocation.id})`.as("item_count"),
    incompleteItemCount:
      sql<number>`count(case when ${schema.taskAllocation.isComplete} = false then 1 end)`.as(
        "incomplete_item_count",
      ),
    itemsComplete:
      sql<boolean>`bool_and(${schema.taskAllocation.isComplete})`.as(
        "items_complete",
      ),
  })
  .from(schema.taskAllocation)
  .groupBy(schema.taskAllocation.taskId)
  .as("task_allocations_aggregation");

const assignedUser = aliasedTable(schema.profile, "assigned_user");
const createdUser = aliasedTable(schema.profile, "created_user");

const overview = db
  .select({
    id: schema.task.id,
    type: schema.task.type,
    itemCount: coalesce(taskAllocationsAggregation.itemCount, 0).as(
      "item_count",
    ),
    incompleteItemCount: coalesce(
      taskAllocationsAggregation.incompleteItemCount,
      0,
    ).as("incomplete_item_count"),
    itemsComplete: coalesce(taskAllocationsAggregation.itemsComplete, true).as(
      "items_complete",
    ),
    isCancelled: schema.task.isCancelled,
    // Assignment info
    assignedToId: sql<number>`${schema.task.assignedToId}`.as("assigned_to_id"),
    assignedToName: sql<string>`${assignedUser.name}`.as("assigned_to_name"),
    createdById: sql<number>`${schema.task.createdById}`.as("created_by_id"),
    createdByName: sql<string>`${createdUser.name}`.as("created_by_name"),
    // Sales order related
    customerId: sql<number>`${schema.salesOrder.customerId}`.as("customer_id"),
    customerName: sql<string>`${schema.customer.name}`.as("customer_name"),
    salesOrderId: sql<number>`${schema.salesOrder.id}`.as("sales_order_id"),
    // Despatch related
    salesDespatchId: sql<number>`${schema.salesDespatch.id}`.as(
      "sales_despatch_id",
    ),
    salesDespatchDate: sql<string>`${schema.salesDespatch.despatchDate}`.as(
      "sales_despatch_date",
    ),
    // Production related
    productionJobId: sql<number>`${schema.productionJob.id}`.as(
      "production_job_id",
    ),
    productionJobBatchId: sql<number>`${schema.productionJob.batchId}`.as(
      "production_job_batch_id",
    ),
    productionJobBatchReference: sql<string>`${schema.batch.batchReference}`.as(
      "production_job_batch_reference",
    ),
    productionJobOutputComponentId: sql<string>`${schema.component.id}`.as(
      "production_job_output_component_id",
    ),
    productionJobOutputComponentDescription:
      sql<string>`${schema.component.description}`.as(
        "production_job_output_component_description",
      ),
  })
  .from(schema.task)
  .leftJoin(
    taskAllocationsAggregation,
    eq(schema.task.id, taskAllocationsAggregation.taskId),
  )
  .leftJoin(
    schema.salesDespatch,
    eq(schema.task.salesDespatchId, schema.salesDespatch.id),
  )
  .leftJoin(
    schema.salesOrder,
    eq(schema.salesDespatch.orderId, schema.salesOrder.id),
  )
  .leftJoin(
    schema.customer,
    eq(schema.salesOrder.customerId, schema.customer.id),
  )
  .leftJoin(
    schema.productionJob,
    eq(schema.task.productionJobId, schema.productionJob.id),
  )
  .leftJoin(
    schema.component,
    eq(schema.productionJob.componentId, schema.component.id),
  )
  .leftJoin(assignedUser, eq(schema.task.assignedToId, assignedUser.id))
  .leftJoin(createdUser, eq(schema.task.createdById, createdUser.id))
  .leftJoin(schema.batch, eq(schema.productionJob.batchId, schema.batch.id))
  .as("overview");

export default datatable(
  {
    id: "number",
    type: "string",
    itemCount: "number",
    incompleteItemCount: "number",
    itemsComplete: "boolean",
    isCancelled: "boolean",
    assignedToId: "number",
    assignedToName: "string",
    createdById: "number",
    createdByName: "string",
    customerId: "number",
    customerName: "string",
    salesOrderId: "number",
    salesDespatchId: "number",
    salesDespatchDate: "string",
    productionJobId: "number",
    productionJobBatchId: "number",
    productionJobBatchReference: "string",
    productionJobOutputComponentId: "string",
    productionJobOutputComponentDescription: "string",
  },
  overview,
);

export const createTask = async (
  tx: Transaction,
  details: typeof schema.task.$inferInsert,
  allocations: (typeof schema.taskAllocation.$inferInsert)[],
) => {
  const tasks = await tx
    .insert(schema.task)
    .values({
      ...details,
    })
    .returning({
      id: schema.task.id,
    });

  const task = tasks[0];
  if (!task) {
    throw new Error("Failed to create task");
  }

  const promises = allocations.map(async (allocation) => {
    return Promise.all([
      calculateOutboundEntry(
        tx,
        {
          componentId: allocation.componentId,
          batchId: allocation.batchId ?? undefined,
        },
        allocation.pickLocationId,
        allocation.quantity,
      ),
      tx.insert(schema.taskAllocation).values(allocation).returning({
        id: schema.taskAllocation.id,
      }),
    ]).then(async ([entry, taskAllocations]) => {
      const taskAllocation = taskAllocations[0];
      if (!taskAllocation) {
        throw new Error("Failed to create task allocation");
      }

      return Promise.all([
        updateInventory(tx, entry, "allocation"),
        tx.insert(schema.taskAllocationLot).values(
          entry.lots.map((lot) => ({
            componentLotId: lot.id,
            taskAllocationId: taskAllocation.id,
            quantity: lot.quantity,
          })),
        ),
      ]);
    });
  });

  await Promise.all(promises);
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

    const entry = {
      componentId: allocation.componentId,
      batchId: allocation.batchId ?? undefined,
      quantity: allocation.quantity,
      lots: allocationLots.map((lot) => ({
        id: lot.componentLotId,
        quantity: lot.quantity,
      })),
    };

    await updateInventory(
      tx,
      { locationId: allocation.pickLocationId, ...entry },
      "deallocation",
    );
  });

  await Promise.all(promises);

  await tx
    .update(schema.task)
    .set({ isCancelled: true })
    .where(eq(schema.task.id, taskId));
};

export const completeTaskAllocation = async (
  tx: Transaction,
  taskAllocationId: number,
  userId: string,
) => {
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

  const entry = {
    componentId: allocation.componentId,
    batchId: allocation.batchId ?? undefined,
    quantity: allocation.quantity,
    lots: allocationLots.map((lot) => ({
      id: lot.componentLotId,
      quantity: lot.quantity,
    })),
  };

  console.log(entry);

  await updateInventory(
    tx,
    { locationId: allocation.pickLocationId, ...entry },
    "deallocation",
  );
  await updateInventory(
    tx,
    { locationId: allocation.pickLocationId, ...entry },
    "outbound",
  );

  const details: LedgerEntryDetails = {
    userId,
    type: allocation.task.type,
  };

  if (allocation.task.type === "despatch") {
    if (!allocation.task.salesDespatchId) {
      throw new Error("Despatch task has no sales despatch id");
    }

    details.salesDespatchItemId = await createSalesDespatchItem(
      tx,
      allocation.task.salesDespatchId,
      entry.quantity,
      entry.componentId,
      entry.batchId,
    );
  }

  if (allocation.task.type === "production") {
    if (!allocation.task.productionJobId || !allocation.putLocationId) {
      throw new Error(
        "Production task has no production job id or put location id",
      );
    }

    details.productionJobAllocationId = await createProductionJobAllocation(
      tx,
      allocation.task.productionJobId,
      {
        ...entry,
        locationId: allocation.putLocationId,
      },
    );
  }

  if (allocation.putLocationId) {
    await updateInventory(
      tx,
      { locationId: allocation.putLocationId, ...entry },
      "inbound",
    );
    await logToLedger(
      tx,
      "inbound",
      { locationId: allocation.putLocationId, ...entry },
      details,
    );

    if (allocation.task.type === "production") {
      await updateInventory(
        tx,
        { locationId: allocation.putLocationId, ...entry },
        "allocation",
      );
    }
  }

  return allocationLots;
};

const createSalesDespatchItem = async (
  tx: Transaction,
  despatchId: number,
  quantity: Decimal,
  componentId: string,
  batchId?: number,
) => {
  const despatchItems = await tx
    .insert(schema.salesDespatchItem)
    .values({
      despatchId: despatchId,
      componentId: componentId,
      batchId: batchId ?? undefined,
      quantity: quantity,
    })
    .returning({
      id: schema.salesDespatchItem.id,
    });

  const despatchItem = despatchItems[0];
  if (!despatchItem) {
    throw new Error("Failed to create despatch item");
  }

  return despatchItem.id;
};

const createProductionJobAllocation = async (
  tx: Transaction,
  productionJobId: number,
  entry: InventoryEntry,
) => {
  const productionJobAllocations = await tx
    .insert(schema.productionJobAllocation)
    .values({
      productionJobId: productionJobId,
      componentId: entry.componentId,
      batchId: entry.batchId,
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
