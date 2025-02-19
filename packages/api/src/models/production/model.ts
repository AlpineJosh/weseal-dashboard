import { eq, publicSchema } from "@repo/db";

import { db } from "../../db";
import { datatable } from "../../lib/datatables";

const { productionJob, component, batch, location } = publicSchema;

const overview = db
  .select({
    id: productionJob.id,
    componentId: productionJob.componentId,
    componentDescription: component.description,
    componentUnit: component.unit,
    batchId: productionJob.batchId,
    batchReference: batch.batchReference,
    targetQuantity: productionJob.targetQuantity,
    quantityProduced: productionJob.quantityProduced,
    outputLocationId: productionJob.outputLocationId,
    outputLocationName: location.name,
    isComplete: productionJob.isComplete,
    createdAt: productionJob.createdAt,
  })
  .from(productionJob)
  .leftJoin(component, eq(productionJob.componentId, component.id))
  .leftJoin(batch, eq(productionJob.batchId, batch.id))
  .leftJoin(location, eq(productionJob.outputLocationId, location.id))
  .as("overview");

export default datatable(
  {
    id: "number",
    componentId: "string",
    componentDescription: "string",
    componentUnit: "string",
    batchId: "number",
    batchReference: "string",
    targetQuantity: "decimal",
    quantityProduced: "decimal",
    outputLocationId: "number",
    outputLocationName: "string",
    isComplete: "boolean",
    createdAt: "string",
  },
  overview,
);
