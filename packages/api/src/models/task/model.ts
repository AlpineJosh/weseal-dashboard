import { aliasedTable, eq, publicSchema, sql } from "@repo/db";

import { db } from "../../db";
import { datatable } from "../../lib/datatables";
import { as } from "../../lib/datatables/types";
import { coalesce } from "../../lib/operators";

const {
  task,
  taskItem,
  salesDespatch,
  salesOrder,
  customer,
  productionJob,
  component,
  profile,
  batch,
} = publicSchema;

// First create a subquery for task items aggregation
const taskItemsAggregation = db
  .select({
    taskId: taskItem.taskId,
    itemCount: as(sql<number>`count(${taskItem.id})`, "item_count", "number"),
    incompleteItemCount: as(
      sql<number>`count(case when ${taskItem.isComplete} = false then 1 end)`,
      "incomplete_item_count",
      "number",
    ),
    isComplete: as(
      sql<boolean>`bool_and(${taskItem.isComplete})`,
      "is_complete",
      "boolean",
    ),
  })
  .from(taskItem)
  .groupBy(taskItem.taskId)
  .as("task_items_aggregation");

const assignedUser = aliasedTable(profile, "assigned_user");
const createdUser = aliasedTable(profile, "created_user");

const overview = db
  .select({
    id: task.id,
    type: task.type,
    itemCount: as(
      coalesce(taskItemsAggregation.itemCount, 0),
      "item_count",
      "number",
    ),
    incompleteItemCount: as(
      coalesce(taskItemsAggregation.incompleteItemCount, 0),
      "incomplete_item_count",
      "number",
    ),
    isComplete: as(
      coalesce(taskItemsAggregation.isComplete, true),
      "is_complete",
      "boolean",
    ),
    isCancelled: task.isCancelled,
    // Assignment info
    assignedToId: task.assignedToId,
    assignedToName: assignedUser.name,
    createdById: task.createdById,
    createdByName: createdUser.name,
    // Sales order related
    customerId: salesOrder.customerId,
    customerName: customer.name,
    salesOrderId: salesOrder.id,
    // Despatch related
    salesDespatchId: salesDespatch.id,
    salesDespatchDate: salesDespatch.despatchDate,
    // Production related
    productionJobId: productionJob.id,
    productionJobBatchId: productionJob.batchId,
    productionJobBatchReference: batch.batchReference,
    productionJobOutputComponentId: component.id,
    productionJobOutputComponentDescription: component.description,
  })
  .from(task)
  .leftJoin(taskItemsAggregation, eq(task.id, taskItemsAggregation.taskId))
  .leftJoin(salesDespatch, eq(task.salesDespatchId, salesDespatch.id))
  .leftJoin(salesOrder, eq(salesDespatch.orderId, salesOrder.id))
  .leftJoin(customer, eq(salesOrder.customerId, customer.id))
  .leftJoin(productionJob, eq(task.productionJobId, productionJob.id))
  .leftJoin(component, eq(productionJob.componentId, component.id))
  .leftJoin(assignedUser, eq(task.assignedToId, assignedUser.id))
  .leftJoin(createdUser, eq(task.createdById, createdUser.id))
  .leftJoin(batch, eq(productionJob.batchId, batch.id))
  .as("overview");

export default datatable(overview);
