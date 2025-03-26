import { eq, schema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatables";

const overview = db
  .select({
    componentId: schema.inventory.componentId,
    componentDescription: schema.component.description,
    componentUnit: schema.component.unit,
    isStockTracked: schema.component.isStockTracked,
    isBatchTracked: schema.component.isBatchTracked,
    batchId: schema.inventory.batchId,
    batchReference: schema.batch.batchReference,
    entryDate: schema.inventory.entryDate,
    locationId: schema.inventory.locationId,
    locationName: schema.location.name,
    totalQuantity: schema.inventory.totalQuantity,
    allocatedQuantity: schema.inventory.allocatedQuantity,
    freeQuantity: schema.inventory.freeQuantity,
  })
  .from(schema.inventory)
  .leftJoin(
    schema.component,
    eq(schema.inventory.componentId, schema.component.id),
  )
  .leftJoin(
    schema.location,
    eq(schema.inventory.locationId, schema.location.id),
  )
  .leftJoin(schema.batch, eq(schema.inventory.batchId, schema.batch.id))
  .as("overview");

export const inventoryQuery = datatable(
  {
    componentId: "string",
    componentDescription: "string",
    componentUnit: "string",
    isStockTracked: "boolean",
    isBatchTracked: "boolean",
    batchId: "number",
    batchReference: "string",
    entryDate: "date",
    locationId: "number",
    locationName: "string",
    totalQuantity: "decimal",
    allocatedQuantity: "decimal",
    freeQuantity: "decimal",
  },
  overview,
);
