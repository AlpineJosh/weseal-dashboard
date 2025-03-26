import { eq, publicSchema, sql, sum } from "@repo/db";

import { db } from "@/db";
import { datatable } from "@/lib/datatables";
import { coalesce } from "@/lib/operators";

const { subcomponent, component, inventory } = publicSchema;

const quantities = db
  .select({
    componentId: inventory.componentId,
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
    totalQuantity: coalesce(quantities.totalQuantity, 0)
      .mapWith(inventory.totalQuantity)
      .as("total_quantity"),
    allocatedQuantity: coalesce(quantities.allocatedQuantity, 0)
      .mapWith(inventory.allocatedQuantity)
      .as("allocated_quantity"),
    freeQuantity: coalesce(quantities.freeQuantity, 0)
      .mapWith(inventory.freeQuantity)
      .as("free_quantity"),
    sageDiscrepancy:
      sql<number>`${coalesce(component.sageQuantity, 0)} - ${coalesce(quantities.totalQuantity, 0)}`
        .mapWith(component.sageQuantity)
        .as("sage_discrepancy"),
  })
  .from(subcomponent)
  .leftJoin(component, eq(subcomponent.subcomponentId, component.id))
  .leftJoin(quantities, eq(subcomponent.subcomponentId, quantities.componentId))
  .as("overview");

export const subcomponentQuery = datatable(
  {
    id: "number",
    componentId: "string",
    subcomponentId: "string",
    quantityRequired: "decimal",
    description: "string",
    hasSubcomponents: "boolean",
    sageQuantity: "decimal",
    unit: "string",
    isStockTracked: "boolean",
    isBatchTracked: "boolean",
    totalQuantity: "decimal",
    allocatedQuantity: "decimal",
    freeQuantity: "decimal",
    sageDiscrepancy: "decimal",
  },
  overview,
);
