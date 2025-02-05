import type { SQL } from "@repo/db";
import { and, count, eq, ne, publicSchema, sum } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatables";
import { as } from "../../../lib/datatables/types";
import { coalesce } from "../../../lib/operators";

const {
  salesOrder,
  customer,
  salesOrderItem,
  salesDespatchItem,
  salesDespatch,
} = publicSchema;

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

const items = db
  .select({
    orderId: salesOrderItem.orderId,
    componentId: salesOrderItem.componentId,
    totalItems: as(count(), "total_items", "number"),
    incompleteItems: as(
      count(
        ne(
          coalesce(sum(salesOrderItem.quantityOrdered), 0),
          coalesce(sum(despatchItems.quantity), 0),
        ),
      ),
      "incomplete_items",
      "number",
    ),
  })
  .from(salesOrderItem)
  .leftJoin(
    despatchItems,
    and(
      eq(salesOrderItem.orderId, despatchItems.orderId),
      eq(salesOrderItem.componentId, despatchItems.componentId),
    ),
  )
  .groupBy(salesOrderItem.orderId, salesOrderItem.componentId)
  .as("items");

const overview = db
  .select({
    id: salesOrder.id,
    customerId: salesOrder.customerId,
    orderDate: salesOrder.orderDate,
    isQuote: salesOrder.isQuote,
    isCancelled: salesOrder.isCancelled,
    isComplete: salesOrder.isComplete,
    isOpen: as(
      and(
        eq(salesOrder.isQuote, false),
        eq(salesOrder.isCancelled, false),
        eq(salesOrder.isComplete, false),
      ) as SQL<boolean>,
      "isOpen",
      "boolean",
    ),
    createdAt: salesOrder.createdAt,
    lastModified: salesOrder.lastModified,
    isDeleted: salesOrder.isDeleted,
    customerName: customer.name,
    totalItems: items.totalItems,
    incompleteItems: items.incompleteItems,
  })
  .from(salesOrder)
  .leftJoin(customer, eq(salesOrder.customerId, customer.id))
  .leftJoin(items, eq(salesOrder.id, items.orderId))
  .as("overview");

export default datatable(overview);
