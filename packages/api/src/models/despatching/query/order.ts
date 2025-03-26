import { db } from "#db";
import { datatable } from "#lib/datatables";
import { coalesce } from "#lib/operators";

import { and, count, eq, ne, publicSchema, sql, sum } from "@repo/db";

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
    quantity: coalesce(sum(salesDespatchItem.quantity), 0).as("quantity"),
  })
  .from(salesDespatchItem)
  .leftJoin(salesDespatch, eq(salesDespatchItem.despatchId, salesDespatch.id))
  .groupBy(salesDespatchItem.componentId, salesDespatch.orderId)
  .as("despatchItems");

const items = db
  .select({
    orderId: salesOrderItem.orderId,
    totalItems: count().as("total_items"),
    incompleteItems: count(
      ne(
        coalesce(salesOrderItem.quantityOrdered, 0),
        coalesce(despatchItems.quantity, 0),
      ),
    ).as("incomplete_items"),
  })
  .from(salesOrderItem)
  .leftJoin(
    despatchItems,
    and(
      eq(salesOrderItem.orderId, despatchItems.orderId),
      eq(salesOrderItem.componentId, despatchItems.componentId),
    ),
  )
  .groupBy(salesOrderItem.orderId)
  .as("items");

const overview = db
  .select({
    id: salesOrder.id,
    customerId: salesOrder.customerId,
    orderDate: salesOrder.orderDate,
    isQuote: salesOrder.isQuote,
    isCancelled: salesOrder.isCancelled,
    isComplete: salesOrder.isComplete,
    isOpen: sql<boolean>`${and(
      eq(salesOrder.isQuote, false),
      eq(salesOrder.isCancelled, false),
      eq(salesOrder.isComplete, false),
    )}`.as("is_open"),
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

export const orderQuery = datatable(
  {
    id: "number",
    customerId: "string",
    orderDate: "date",
    isQuote: "boolean",
    isCancelled: "boolean",
    isComplete: "boolean",
    isOpen: "boolean",
    createdAt: "date",
    lastModified: "date",
    isDeleted: "boolean",
    customerName: "string",
    totalItems: "number",
    incompleteItems: "number",
  },
  overview,
);
