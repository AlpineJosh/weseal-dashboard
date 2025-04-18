import { db } from "#db";
import { datatable } from "#lib/datatables";

import { eq, publicSchema } from "@repo/db";

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
    componentStockTracked: component.isStockTracked,
    componentBatchTracked: component.isBatchTracked,
  })
  .from(salesDespatchItem)
  .leftJoin(component, eq(salesDespatchItem.componentId, component.id))
  .leftJoin(batch, eq(salesDespatchItem.batchId, batch.id))
  .as("overview");

export const despatchItemQuery = datatable(
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
    componentStockTracked: "boolean",
    componentBatchTracked: "boolean",
  },
  overview,
);
