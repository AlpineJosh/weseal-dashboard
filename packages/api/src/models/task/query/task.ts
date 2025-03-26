import { db } from "#db";
import { datatable } from "#lib/datatables";
import { coalesce } from "#lib/operators";

import { aliasedTable, eq, schema, sql } from "@repo/db";

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

export const taskQuery = datatable(
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
