import { and, eq, sql, sum } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

const totalQuantity = db.$with("total_quantity").as(
  db
    .select({
      batchId: schema.batchMovement.batchId,
      locationId: schema.batchMovement.locationId,
      quantity: sum(schema.batchMovement.quantity).as("quantity"),
    })
    .from(schema.batchMovement)
    .groupBy(schema.batchMovement.batchId, schema.batchMovement.locationId),
);

const taskQuantity = db.$with("task_quantity").as(
  db
    .select({
      batchId: schema.taskItem.batchId,
      locationId: schema.taskItem.pickLocationId,
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
    .groupBy(schema.taskItem.batchId, schema.taskItem.pickLocationId),
);

const productionQuantity = db.$with("production_quantity").as(
  db
    .select({
      batchId: schema.productionBatchIn.batchId,
      locationId: schema.productionBatchIn.locationId,
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
    .groupBy(
      schema.productionBatchIn.batchId,
      schema.productionBatchIn.locationId,
    ),
);

export const locationOverview = db
  .with(totalQuantity, taskQuantity, productionQuantity)
  .select({
    locationId: schema.location.id,
    locationName: schema.location.name,
    batchId: schema.batch.id,
    componentId: schema.batch.componentId,
    batchReference: schema.batch.batchReference,
    entryDate: schema.batch.entryDate,
    quantity: totalQuantity.quantity,
    isPickable: schema.locationType.isPickable,
    isTransient: schema.locationType.isTransient,
    allocated:
      sql<number>`${taskQuantity.allocated} + ${productionQuantity.allocated}`.as(
        "allocated",
      ),
  })
  .from(totalQuantity)
  .leftJoin(schema.location, eq(totalQuantity.locationId, schema.location.id))
  .leftJoin(
    schema.locationType,
    eq(schema.location.typeId, schema.locationType.id),
  )
  .leftJoin(schema.batch, eq(totalQuantity.batchId, schema.batch.id))
  .leftJoin(
    taskQuantity,
    and(
      eq(schema.batch.id, taskQuantity.batchId),
      eq(schema.location.id, taskQuantity.locationId),
    ),
  )
  .leftJoin(
    productionQuantity,
    and(
      eq(schema.batch.id, productionQuantity.batchId),
      eq(schema.location.id, productionQuantity.locationId),
    ),
  )
  .as("location_overview");
