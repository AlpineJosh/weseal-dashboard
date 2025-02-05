import { and, count, eq, min, publicSchema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatables";
import { as } from "../../../lib/datatables/types";

const { customer, salesOrder } = publicSchema;

const orders = db
  .select({
    id: salesOrder.id,
    customerId: salesOrder.customerId,
    openOrders: as(count(), "openOrders", "number"),
    nextOrderDate: as(min(salesOrder.orderDate), "nextOrderDate", "date"),
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

export default datatable(overview);
