import { eq, publicSchema } from "@repo/db";

import { db } from "../../../../db";
import { datatable } from "../../../../lib/datatables";

const { salesDespatchItem, component, batch } = publicSchema;

const overview = db
  .select({
    id: salesDespatchItem.id,
    despatchId: salesDespatchItem.despatchId,
    componentId: salesDespatchItem.componentId,
    batchId: salesDespatchItem.batchId,
    quantity: salesDespatchItem.quantity,
    componentDescription: component.description,
    componentUnit: component.unit,
    batchReference: batch.batchReference,
    createdAt: salesDespatchItem.createdAt,
    lastModified: salesDespatchItem.lastModified,
  })
  .from(salesDespatchItem)
  .leftJoin(component, eq(salesDespatchItem.componentId, component.id))
  .leftJoin(batch, eq(salesDespatchItem.batchId, batch.id))
  .as("overview");

export default datatable(
  {
    id: "number",
    despatchId: "number",
    componentId: "string",
    batchId: "number",
    quantity: "decimal",
    componentDescription: "string",
    componentUnit: "string",
    batchReference: "string",
    createdAt: "string",
    lastModified: "string",
  },
  overview,
);
