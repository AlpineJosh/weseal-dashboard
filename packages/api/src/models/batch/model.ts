import { eq, isNotNull, min, publicSchema, sum } from "@repo/db";

import { db } from "../../db";
import { datatable } from "../../lib/datatables";
import { coalesce } from "../../lib/operators";

const { batch, component, inventory } = publicSchema;

const quantities = db
  .select({
    batchId: inventory.batchId,
    entryDate: min(inventory.entryDate)
      .mapWith(inventory.entryDate)
      .as("entry_date"),
    totalQuantity: sum(inventory.totalQuantity)
      .mapWith(inventory.totalQuantity)
      .as("total_quantity"),
    allocatedQuantity: sum(inventory.allocatedQuantity)
      .mapWith(inventory.allocatedQuantity)
      .as("allocated_quantity"),
    freeQuantity: sum(inventory.freeQuantity)
      .mapWith(inventory.freeQuantity)
      .as("free_quantity"),
  })
  .from(inventory)
  .where(isNotNull(inventory.batchId))
  .groupBy(inventory.batchId)
  .as("quantities");

const overview = db
  .select({
    id: batch.id,
    componentId: batch.componentId,
    componentDescription: component.description,
    componentUnit: component.unit,
    batchReference: batch.batchReference,
    entryDate: quantities.entryDate,
    totalQuantity: coalesce(quantities.totalQuantity, 0)
      .mapWith(inventory.totalQuantity)
      .as("total_quantity"),
    freeQuantity: coalesce(quantities.freeQuantity, 0)
      .mapWith(inventory.freeQuantity)
      .as("free_quantity"),
    allocatedQuantity: coalesce(quantities.allocatedQuantity, 0)
      .mapWith(inventory.allocatedQuantity)
      .as("allocated_quantity"),
  })
  .from(batch)
  .leftJoin(component, eq(batch.componentId, component.id))
  .leftJoin(quantities, eq(batch.id, quantities.batchId))
  .as("overview");

export default datatable(
  {
    id: "number",
    componentId: "string",
    componentDescription: "string",
    componentUnit: "string",
    batchReference: "string",
    entryDate: "date",
    totalQuantity: "decimal",
    freeQuantity: "decimal",
    allocatedQuantity: "decimal",
  },
  overview,
);
