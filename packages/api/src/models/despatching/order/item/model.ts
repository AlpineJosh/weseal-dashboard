import { and, eq, publicSchema, sum } from "@repo/db";

import { db } from "../../../../db";
import { datatable } from "../../../../lib/datatables";
import { as } from "../../../../lib/datatables/types";
import { coalesce } from "../../../../lib/operators";

const { salesOrderItem, component, salesDespatch, salesDespatchItem } =
  publicSchema;

const despatchItems = db
  .select({
    orderId: salesDespatch.orderId,
    componentId: salesDespatchItem.componentId,
    quantity: as(
      coalesce(sum(salesDespatchItem.quantity), 0),
      "quantity",
      "number",
    ),
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
    quantityDespatched: despatchItems.quantity,
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

export default datatable(overview);
