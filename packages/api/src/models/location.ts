import { and, eq, sql, sum } from "@repo/db";
import { db } from "@repo/db/client";
import {
  batch,
  location,
  locationType,
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
      locationId: stockTransaction.locationId,
      quantity: sum(stockTransaction.quantity).as("quantity"),
    })
    .from(stockTransaction)
    .groupBy(stockTransaction.batchId, stockTransaction.locationId),
);

const taskQuantity = db.$with("task_quantity").as(
  db
    .select({
      batchId: taskItem.batchId,
      locationId: taskItem.pickLocationId,
      allocated: sum(taskItem.quantity).as("allocated"),
    })
    .from(taskItem)
    .leftJoin(task, eq(taskItem.taskId, task.id))
    .where(and(eq(task.isCancelled, false), eq(taskItem.isComplete, false)))
    .groupBy(taskItem.batchId, taskItem.pickLocationId),
);

const productionQuantity = db.$with("production_quantity").as(
  db
    .select({
      batchId: productionJobItem.batchId,
      locationId: productionJobItem.locationId,
      allocated: sum(
        sql<number>`${productionJobItem.quantityAllocated} - ${productionJobItem.quantityUsed}`,
      ).as("allocated"),
    })
    .from(productionJobItem)
    .leftJoin(productionJob, eq(productionJobItem.jobId, productionJob.id))
    .where(eq(productionJob.isActive, false))
    .groupBy(productionJobItem.batchId, productionJobItem.locationId),
);

export const locationOverview = db
  .with(totalQuantity, taskQuantity, productionQuantity)
  .select({
    locationId: location.id,
    locationName: location.name,
    batchId: batch.id,
    componentId: batch.componentId,
    batchNumber: batch.batchNumber,
    batchDate: batch.date,
    quantity: totalQuantity.quantity,
    isPickable: locationType.isPickable,
    isTransient: locationType.isTransient,
    allocated:
      sql<number>`${taskQuantity.allocated} + ${productionQuantity.allocated}`.as(
        "allocated",
      ),
  })
  .from(totalQuantity)
  .leftJoin(location, eq(totalQuantity.locationId, location.id))
  .leftJoin(locationType, eq(location.typeId, locationType.id))
  .leftJoin(batch, eq(totalQuantity.batchId, batch.id))
  .leftJoin(
    taskQuantity,
    and(
      eq(batch.id, taskQuantity.batchId),
      eq(location.id, taskQuantity.locationId),
    ),
  )
  .leftJoin(
    productionQuantity,
    and(
      eq(batch.id, productionQuantity.batchId),
      eq(batch.id, productionQuantity.locationId),
    ),
  )
  .as("location_overview");
