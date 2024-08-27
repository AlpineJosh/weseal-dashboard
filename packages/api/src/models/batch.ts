import { and, eq, sql, sum } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

const totalQuantity = db.$with("total_quantity").as(
  db
    .select({
      batchId: schema.batchMovement.batchId,
      quantity: sum(schema.batchMovement.quantity).as("quantity"),
    })
    .from(schema.batchMovement)
    .groupBy(schema.batchMovement.batchId),
);

const taskQuantity = db.$with("task_quantity").as(
  db
    .select({
      batchId: schema.taskItem.batchId,
      allocated: sum(schema.taskItem.quantity).as("allocated"),
    })
    .from(schema.taskItem)
    .leftJoin(schema.task, eq(schema.taskItem.taskId, schema.task.id))
    .where(
      and(
        eq(schema.task.isCancelled, false),
        eq(schema.taskItem.isComplete, false),
      ),
    )
    .groupBy(schema.taskItem.batchId),
);

const productionQuantity = db.$with("production_quantity").as(
  db
    .select({
      batchId: schema.productionBatchIn.batchId,
      allocated: sum(
        sql<number>`${schema.productionBatchIn.quantityAllocated} - ${schema.productionBatchIn.quantityUsed}`,
      ).as("allocated"),
    })
    .from(schema.productionBatchIn)
    .leftJoin(
      schema.productionJob,
      eq(schema.productionBatchIn.jobId, schema.productionJob.id),
    )
    .where(eq(schema.productionJob.isActive, false))
    .groupBy(schema.productionBatchIn.batchId),
);

export const batchOverview = db
  .with(totalQuantity, taskQuantity, productionQuantity)
  .select({
    batchId: schema.batch.id,
    componentId: schema.batch.componentId,
    batchReference: schema.batch.batchReference,
    entryDate: schema.batch.entryDate,
    quantity: totalQuantity.quantity,
    allocated:
      sql<number>`${taskQuantity.allocated} + ${productionQuantity.allocated}`.as(
        "allocated",
      ),
  })
  .from(schema.batch)
  .leftJoin(totalQuantity, eq(schema.batch.id, totalQuantity.batchId))
  .leftJoin(taskQuantity, eq(schema.batch.id, taskQuantity.batchId))
  .leftJoin(productionQuantity, eq(schema.batch.id, productionQuantity.batchId))
  .as("batch_overview");
