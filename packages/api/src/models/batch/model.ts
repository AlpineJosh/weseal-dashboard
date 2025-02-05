import { eq, isNotNull, min, not, publicSchema, sum } from "@repo/db";

import { db } from "../../db";
import { datatable } from "../../lib/datatables";
import { as } from "../../lib/datatables/types";
import { coalesce } from "../../lib/operators";

const { batch, component, inventory } = publicSchema;

const quantities = db
  .select({
    batchId: inventory.batchId,
    entryDate: as(min(inventory.entryDate), "entry_date", "date"),
    totalQuantity: as(sum(inventory.totalQuantity), "total_quantity", "number"),
    allocatedQuantity: as(
      sum(inventory.allocatedQuantity),
      "allocated_quantity",
      "number",
    ),
    freeQuantity: as(sum(inventory.freeQuantity), "free_quantity", "number"),
  })
  .from(inventory)
  .where(not(isNotNull(inventory.batchId)))
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
    totalQuantity: as(
      coalesce(quantities.totalQuantity, 0),
      "total_quantity",
      "number",
    ),
    freeQuantity: as(
      coalesce(quantities.freeQuantity, 0),
      "free_quantity",
      "number",
    ),
    allocatedQuantity: as(
      coalesce(quantities.allocatedQuantity, 0),
      "allocated_quantity",
      "number",
    ),
  })
  .from(batch)
  .leftJoin(component, eq(batch.componentId, component.id))
  .leftJoin(quantities, eq(batch.id, quantities.batchId))
  .as("overview");

export default datatable(overview);
