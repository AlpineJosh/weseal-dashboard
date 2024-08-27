import { and, eq, sql, sum } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { coalesce } from "../lib/operators";

const totalQuantity = db.$with("total_quantity").as(
  db
    .select({
      componentId: schema.batch.componentId,
      quantity: sum(schema.batchMovement.quantity).as("quantity"),
    })
    .from(schema.batchMovement)
    .leftJoin(schema.batch, eq(schema.batchMovement.batchId, schema.batch.id))
    .groupBy(schema.batch.componentId),
);

const taskQuantity = db.$with("task_quantity").as(
  db
    .select({
      componentId: schema.batch.componentId,
      allocated: sum(schema.taskItem.quantity).as("allocated_task"),
    })
    .from(schema.taskItem)
    .leftJoin(schema.batch, eq(schema.taskItem.batchId, schema.batch.id))
    .leftJoin(schema.task, eq(schema.taskItem.taskId, schema.task.id))
    .where(
      and(
        eq(schema.task.isCancelled, false),
        eq(schema.taskItem.isComplete, false),
      ),
    )
    .groupBy(schema.batch.componentId),
);

const productionQuantity = db.$with("production_quantity").as(
  db
    .select({
      componentId: schema.batch.componentId,
      allocated: sum(
        sql<number>`${schema.productionBatchIn.quantityAllocated} - ${schema.productionBatchIn.quantityUsed}`,
      ).as("allocated_production"),
    })
    .from(schema.productionBatchIn)
    .leftJoin(
      schema.batch,
      eq(schema.productionBatchIn.batchId, schema.batch.id),
    )
    .leftJoin(
      schema.productionJob,
      eq(schema.productionBatchIn.jobId, schema.productionJob.id),
    )
    .where(eq(schema.productionJob.isActive, false))
    .groupBy(schema.batch.componentId),
);

export const componentOverview = db
  .with(totalQuantity, taskQuantity, productionQuantity)
  .select({
    id: schema.component.id,
    description: schema.component.description,
    category: schema.componentCategory.name,
    categoryId: schema.componentCategory.id,
    unit: schema.component.unit,
    sageQuantity: coalesce(schema.component.sageQuantity, 0).as("sageQuantity"),
    hasSubcomponents: schema.component.hasSubcomponents,
    department: schema.department.name,
    departmentId: schema.department.id,
    quantity: coalesce(totalQuantity.quantity, 0).as("quantity"),
    allocated: coalesce(
      sql<number>`${taskQuantity.allocated} + ${productionQuantity.allocated}`,
      0,
    ).as("allocated"),
  })
  .from(schema.component)
  .leftJoin(
    schema.componentCategory,
    eq(schema.component.categoryId, schema.componentCategory.id),
  )
  .leftJoin(
    schema.department,
    eq(schema.component.departmentId, schema.department.id),
  )
  .leftJoin(totalQuantity, eq(schema.component.id, totalQuantity.componentId))
  .leftJoin(taskQuantity, eq(schema.component.id, taskQuantity.componentId))
  .leftJoin(
    productionQuantity,
    eq(schema.component.id, productionQuantity.componentId),
  )
  .as("component_overview");
