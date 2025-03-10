import { and, count, eq, min, publicSchema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatables";

const { customer, salesOrder } = publicSchema;

const orders = db
  .select({
    customerId: salesOrder.customerId,
    openOrders: count().as("open_orders"),
    nextOrderDate: min(salesOrder.orderDate).as("next_order_date"),
  })
  .from(salesOrder)
  .where(
    and(
      eq(salesOrder.isComplete, false),
      eq(salesOrder.isCancelled, false),
      eq(salesOrder.isQuote, false),
    ),
  )
  .groupBy(salesOrder.customerId)
  .as("orders");

const overview = db
  .select({
    id: customer.id,
    name: customer.name,
    createdAt: customer.createdAt,
    openOrders: orders.openOrders,
  })
  .from(customer)
  .leftJoin(orders, eq(customer.id, orders.customerId))
  .as("overview");

export default datatable(
  {
    id: "string",
    name: "string",
    createdAt: "string",
    openOrders: "number",
  },
  overview,
);
