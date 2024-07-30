import { and, eq, sql, sum } from "@repo/db";
import { db } from "@repo/db/client";
import {
  department,
  stockCategory,
  stockComponent,
} from "@repo/db/schema/sage";
import {
  batch,
  productionJob,
  productionJobItem,
  stockMeta,
  stockTransaction,
  task,
  taskItem,
} from "@repo/db/schema/stock";
import { coalesce } from "../lib/operators";

const totalQuantity = db.$with("total_quantity").as(
  db
    .select({
      componentId: batch.componentId,
      quantity: sum(stockTransaction.quantity).as("quantity"),
    })
    .from(stockTransaction)
    .leftJoin(batch, eq(stockTransaction.batchId, batch.id))
    .groupBy(batch.componentId),
);

const taskQuantity = db.$with("task_quantity").as(
  db
    .select({
      componentId: batch.componentId,
      allocated: sum(taskItem.quantity).as("allocated_task"),
    })
    .from(taskItem)
    .leftJoin(batch, eq(taskItem.batchId, batch.id))
    .leftJoin(task, eq(taskItem.taskId, task.id))
    .where(and(eq(task.isCancelled, false), eq(taskItem.isComplete, false)))
    .groupBy(batch.componentId),
);

const productionQuantity = db.$with("production_quantity").as(
  db
    .select({
      componentId: batch.componentId,
      allocated: sum(
        sql<number>`${productionJobItem.quantityAllocated} - ${productionJobItem.quantityUsed}`,
      ).as("allocated_production"),
    })
    .from(productionJobItem)
    .leftJoin(batch, eq(productionJobItem.batchId, batch.id))
    .leftJoin(productionJob, eq(productionJobItem.jobId, productionJob.id))
    .where(eq(productionJob.isActive, false))
    .groupBy(batch.componentId),
);

export const componentOverview = db
  .with(totalQuantity, taskQuantity, productionQuantity)
  .select({
    id: stockComponent.id,
    description: stockComponent.description,
    category: sql`${stockCategory.name}`.as("category"),
    categoryId: sql`${stockCategory.id}`.as("categoryId"),
    unitOfSale: stockComponent.unitOfSale,
    sageQuantity: coalesce(stockComponent.quantityInStock, 0).as("sageQuantity"),
    hasSubcomponents: stockComponent.hasSubcomponents,
    department: sql`${department.name}`.as("department"),
    departmentId: sql`${department.id}`.as("departmentId"),
    quantity: coalesce(totalQuantity.quantity, 0).as("quantity"),
    allocated:
      coalesce(sql<number>`${taskQuantity.allocated} + ${productionQuantity.allocated}`, 0).as(
        "allocated",
      ),
  })
  .from(stockComponent)
  .leftJoin(stockMeta, eq(stockComponent.id, stockMeta.componentId))
  .leftJoin(stockCategory, eq(stockComponent.stockCategoryId, stockCategory.id))
  .leftJoin(department, eq(stockComponent.departmentId, department.id))
  .leftJoin(totalQuantity, eq(stockComponent.id, totalQuantity.componentId))
  .leftJoin(taskQuantity, eq(stockComponent.id, taskQuantity.componentId))
  .leftJoin(
    productionQuantity,
    eq(stockComponent.id, productionQuantity.componentId),
  )
  .as("component_overview");
