import { db } from "#db";
import { datatable } from "#lib/datatables";

import { and, count, eq, not, publicSchema } from "@repo/db";

const { supplier, purchaseOrder } = publicSchema;

const orders = db
  .select({
    supplierId: purchaseOrder.supplierId,
    orderCount: count().as("order_count"),
    openOrderCount: count(
      and(not(purchaseOrder.isComplete), not(purchaseOrder.isCancelled)),
    ).as("open_order_count"),
  })
  .from(purchaseOrder)
  .groupBy(purchaseOrder.supplierId)
  .as("orders");

const overview = db
  .select({
    id: supplier.id,
    name: supplier.name,
    createdAt: supplier.createdAt,
    lastModified: supplier.lastModified,
    isDeleted: supplier.isDeleted,
    orderCount: orders.orderCount,
    openOrderCount: orders.openOrderCount,
  })
  .from(supplier)
  .leftJoin(orders, eq(supplier.id, orders.supplierId))
  .as("overview");

export const supplierQuery = datatable(
  {
    id: "string",
    name: "string",
    createdAt: "string",
    lastModified: "string",
    isDeleted: "boolean",
    orderCount: "number",
    openOrderCount: "number",
  },
  overview,
);
