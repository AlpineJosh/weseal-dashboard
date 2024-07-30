import { and, eq, sql, sum } from "@repo/db";
import { db } from "@repo/db/client";
import {
  batch,
  productionJob,
  productionJobItem,
  stockTransaction,
  task,
  taskItem,
} from "@repo/db/schema/stock";

const totalQuantity = db.$with("total_quantity").as(
  db
    .select({
      batchId: stockTransaction.batchId,
      quantity: sum(stockTransaction.quantity).as("quantity"),
    })
    .from(stockTransaction)
    .groupBy(stockTransaction.batchId),
);

const taskQuantity = db.$with("task_quantity").as(
  db
    .select({
      batchId: taskItem.batchId,
      allocated: sum(taskItem.quantity).as("allocated"),
    })
    .from(taskItem)
    .leftJoin(task, eq(taskItem.taskId, task.id))
    .where(and(eq(task.isCancelled, false), eq(taskItem.isComplete, false)))
    .groupBy(taskItem.batchId),
);

const productionQuantity = db.$with("production_quantity").as(
  db
    .select({
      batchId: productionJobItem.batchId,
      allocated: sum(
        sql<number>`${productionJobItem.quantityAllocated} - ${productionJobItem.quantityUsed}`,
      ).as("allocated"),
    })
    .from(productionJobItem)
    .leftJoin(productionJob, eq(productionJobItem.jobId, productionJob.id))
    .where(eq(productionJob.isActive, false))
    .groupBy(productionJobItem.batchId),
);

export const batchOverview = db
  .with(totalQuantity, taskQuantity, productionQuantity)
  .select({
    batchId: batch.id,
    componentId: batch.componentId,
    batchNumber: batch.batchNumber,
    batchDate: batch.date,
    quantity: totalQuantity.quantity,
    allocated:
      sql<number>`${taskQuantity.allocated} + ${productionQuantity.allocated}`.as(
        "allocated",
      ),
  })
  .from(batch)
  .leftJoin(totalQuantity, eq(batch.id, totalQuantity.batchId))
  .leftJoin(taskQuantity, eq(batch.id, taskQuantity.batchId))
  .leftJoin(productionQuantity, eq(batch.id, productionQuantity.batchId))
  .as("batch_overview");
