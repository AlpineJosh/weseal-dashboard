import { eq, publicSchema, sql, sum } from "@repo/db";

import { db } from "../../db";
import { datatable } from "../../lib/datatables";
import { coalesce } from "../../lib/operators";

const { component, componentCategory, department, inventory } = publicSchema;

const quantities = db
  .select({
    componentId: inventory.componentId,
    totalQuantity: sum(inventory.totalQuantity).as("total_quantity"),
    allocatedQuantity: sum(inventory.allocatedQuantity).as(
      "allocated_quantity",
    ),
    freeQuantity: sum(inventory.freeQuantity).as("free_quantity"),
  })
  .from(inventory)
  .groupBy(inventory.componentId)
  .as("quantities");

const overview = db
  .select({
    id: component.id,
    description: component.description,
    hasSubcomponents: component.hasSubcomponents,
    sageQuantity: component.sageQuantity,
    unit: component.unit,
    categoryId: component.categoryId,
    departmentId: component.departmentId,
    isStockTracked: component.isStockTracked,
    isBatchTracked: component.isBatchTracked,
    defaultLocationId: component.defaultLocationId,
    requiresQualityCheck: component.requiresQualityCheck,
    qualityCheckDetails: component.qualityCheckDetails,
    createdAt: component.createdAt,
    lastModified: component.lastModified,
    isDeleted: component.isDeleted,
    totalQuantity: coalesce(quantities.totalQuantity, 0).as("total_quantity"),
    allocatedQuantity: coalesce(quantities.allocatedQuantity, 0).as(
      "allocated_quantity",
    ),
    freeQuantity: coalesce(quantities.freeQuantity, 0).as("free_quantity"),
    sageDiscrepancy:
      sql<number>`${coalesce(component.sageQuantity, 0)} - ${coalesce(quantities.totalQuantity, 0)}`.as(
        "sage_discrepancy",
      ),
    categoryName: componentCategory.name,
    departmentName: department.name,
  })
  .from(component)
  .leftJoin(quantities, eq(component.id, quantities.componentId))
  .leftJoin(componentCategory, eq(component.categoryId, componentCategory.id))
  .leftJoin(department, eq(component.departmentId, department.id))
  .as("overview");

export default datatable(overview);
