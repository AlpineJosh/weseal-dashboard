import { eq, publicSchema, sql, sum } from "@repo/db";

import { db } from "../../db";
import { datatable } from "../../lib/datatables";
import { coalesce } from "../../lib/operators";

const { component, componentCategory, department, inventory } = publicSchema;

const quantities = db
  .select({
    componentId: inventory.componentId,
    totalQuantity: sum(inventory.totalQuantity)
      .mapWith(inventory.totalQuantity)
      .as("total_quantity"),
    allocatedQuantity: sum(inventory.allocatedQuantity)
      .mapWith(inventory.allocatedQuantity)
      .as("allocated_quantity"),
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
    categoryName: sql`${componentCategory.name}`.as("category_name"),
    departmentName: sql`${department.name}`.as("department_name"),
  })
  .from(component)
  .leftJoin(quantities, eq(component.id, quantities.componentId))
  .leftJoin(componentCategory, eq(component.categoryId, componentCategory.id))
  .leftJoin(department, eq(component.departmentId, department.id))
  .as("overview");

export default datatable(
  {
    id: "string",
    description: "string",
    hasSubcomponents: "boolean",
    sageQuantity: "decimal",
    unit: "string",
    categoryId: "string",
    departmentId: "string",
    isStockTracked: "boolean",
    isBatchTracked: "boolean",
    defaultLocationId: "string",
    requiresQualityCheck: "boolean",
    qualityCheckDetails: "string",
    createdAt: "string",
    lastModified: "string",
    isDeleted: "boolean",
    totalQuantity: "decimal",
    allocatedQuantity: "decimal",
    freeQuantity: "decimal",
    sageDiscrepancy: "decimal",
    categoryName: "string",
    departmentName: "string",
  },
  overview,
);
