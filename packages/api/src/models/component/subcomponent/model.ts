import { eq, publicSchema, sql, sum } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatables";
import { as } from "../../../lib/datatables/types";
import { coalesce } from "../../../lib/operators";

const { subcomponent, component, inventory } = publicSchema;

const quantities = db
  .select({
    componentId: inventory.componentId,
    totalQuantity: as(sum(inventory.totalQuantity), "total_quantity", "number"),
    allocatedQuantity: as(
      sum(inventory.allocatedQuantity),
      "allocated_quantity",
      "number",
    ),
    freeQuantity: as(sum(inventory.freeQuantity), "free_quantity", "number"),
  })
  .from(inventory)
  .groupBy(inventory.componentId)
  .as("quantities");

const overview = db
  .select({
    id: subcomponent.id,
    componentId: subcomponent.componentId,
    subcomponentId: subcomponent.subcomponentId,
    quantityRequired: subcomponent.quantity,
    description: component.description,
    hasSubcomponents: component.hasSubcomponents,
    sageQuantity: component.sageQuantity,
    unit: component.unit,
    isStockTracked: component.isStockTracked,
    isBatchTracked: component.isBatchTracked,
    totalQuantity: as(
      coalesce(quantities.totalQuantity, 0),
      "total_quantity",
      "number",
    ),
    allocatedQuantity: as(
      coalesce(quantities.allocatedQuantity, 0),
      "allocated_quantity",
      "number",
    ),
    freeQuantity: as(
      coalesce(quantities.freeQuantity, 0),
      "free_quantity",
      "number",
    ),
    sageDiscrepancy: as(
      sql<number>`${coalesce(component.sageQuantity, 0)} - ${coalesce(quantities.totalQuantity, 0)}`,
      "sage_discrepancy",
      "number",
    ),
  })
  .from(subcomponent)
  .leftJoin(component, eq(subcomponent.subcomponentId, component.id))
  .as("overview");

export default datatable(overview);
