import { db } from "#db";
import { datatable } from "#lib/datatables";
import { coalesce } from "#lib/operators";

import { and, eq, publicSchema, sum } from "@repo/db";

const { salesOrderItem, component, salesDespatch, salesDespatchItem } =
  publicSchema;

const despatchItems = db
  .select({
    orderId: salesDespatch.orderId,
    componentId: salesDespatchItem.componentId,
    quantity: coalesce(sum(salesDespatchItem.quantity), 0)
      .mapWith(salesDespatchItem.quantity)
      .as("quantity"),
  })
  .from(salesDespatchItem)
  .leftJoin(salesDespatch, eq(salesDespatchItem.despatchId, salesDespatch.id))
  .groupBy(salesDespatchItem.componentId, salesDespatch.orderId)
  .as("despatchItems");

const overview = db
  .select({
    id: salesOrderItem.id,
    orderId: salesOrderItem.orderId,
    componentId: salesOrderItem.componentId,
    quantityOrdered: salesOrderItem.quantityOrdered,
    quantityDespatched: coalesce(despatchItems.quantity, 0)
      .mapWith(salesDespatchItem.quantity)
      .as("quantity_despatched"),
    sageQuantityDespatched: salesOrderItem.sageQuantityDespatched,
    createdAt: salesOrderItem.createdAt,
    lastModified: salesOrderItem.lastModified,
    isDeleted: salesOrderItem.isDeleted,
    componentDescription: component.description,
    componentUnit: component.unit,
  })
  .from(salesOrderItem)
  .leftJoin(component, eq(salesOrderItem.componentId, component.id))
  .leftJoin(
    despatchItems,
    and(
      eq(salesOrderItem.orderId, despatchItems.orderId),
      eq(salesOrderItem.componentId, despatchItems.componentId),
    ),
  )
  .as("overview");

export const orderItemQuery = datatable(
  {
    id: "number",
    orderId: "number",
    componentId: "string",
    quantityOrdered: "decimal",
    quantityDespatched: "decimal",
    sageQuantityDespatched: "decimal",
    createdAt: "date",
    lastModified: "date",
    isDeleted: "boolean",
    componentDescription: "string",
    componentUnit: "string",
  },
  overview,
);
