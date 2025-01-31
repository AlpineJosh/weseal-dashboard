import type { z } from "zod";

import { eq, schema, sql, sum } from "@repo/db";

import { db } from "../db";
import { datatable } from "../lib/datatables";
import { coalesce } from "../lib/operators";

const { component, componentCategory, department, inventoryOverview } =
  schema.base;

const quantities = db
  .select({
    componentId: inventoryOverview.componentId,
    total: sum(inventoryOverview.total).as("total"),
    allocated: sum(inventoryOverview.allocated).as("allocated"),
    free: sum(inventoryOverview.free).as("free"),
  })
  .from(inventoryOverview)
  .groupBy(inventoryOverview.componentId)
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
    totalQuantity: coalesce(quantities.total, 0).as("total_quantity"),
    allocatedQuantity: coalesce(quantities.allocated, 0).as(
      "allocated_quantity",
    ),
    freeQuantity: coalesce(quantities.free, 0).as("free_quantity"),
    sageDiscrepancy:
      sql<number>`${coalesce(component.sageQuantity, 0)} - ${coalesce(quantities.total, 0)}`.as(
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

const componentDatatable = datatable(overview);

export const Component = {
  datatable: componentDatatable,
};
