import { db } from "#db";
import { datatable } from "#lib/datatables";
import { eq, sum } from "drizzle-orm";

import { schema } from "@repo/db";

const { batch, component, productionJobAllocation } = schema;

const overview = db
  .select({
    id: productionJobAllocation.id,
    jobId: productionJobAllocation.productionJobId,
    componentId: productionJobAllocation.componentId,
    componentDescription: component.description,
    componentUnit: component.unit,

    batchId: productionJobAllocation.batchId,
    batchReference: batch.batchReference,

    totalQuantity: sum(productionJobAllocation.totalQuantity)
      .mapWith(productionJobAllocation.totalQuantity)
      .as("total_quantity"),
    usedQuantity: sum(productionJobAllocation.usedQuantity)
      .mapWith(productionJobAllocation.usedQuantity)
      .as("used_quantity"),
    remainingQuantity: sum(productionJobAllocation.remainingQuantity)
      .mapWith(productionJobAllocation.remainingQuantity)
      .as("remaining_quantity"),
  })
  .from(productionJobAllocation)
  .leftJoin(component, eq(productionJobAllocation.componentId, component.id))
  .leftJoin(batch, eq(productionJobAllocation.batchId, batch.id))
  .groupBy(
    productionJobAllocation.id,
    productionJobAllocation.productionJobId,
    productionJobAllocation.componentId,
    component.description,
    component.unit,
    productionJobAllocation.batchId,
    batch.batchReference,
  )
  .as("overview");

export const productionJobAllocationQuery = datatable(
  {
    id: "number",
    jobId: "number",
    componentId: "string",
    componentDescription: "string",
    componentUnit: "string",
    batchId: "number",
    batchReference: "string",
    totalQuantity: "decimal",
    usedQuantity: "decimal",
    remainingQuantity: "decimal",
  },
  overview,
);
