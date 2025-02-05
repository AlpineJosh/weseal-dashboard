import { and, count, eq, not, publicSchema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatables";
import { as } from "../../../lib/datatables/types";

const { supplier, purchaseOrder } = publicSchema;

const orders = db
  .select({
    supplierId: purchaseOrder.supplierId,
    orderCount: as(count(), "order_count", "number"),
    openOrderCount: as(
      count(and(not(purchaseOrder.isComplete), not(purchaseOrder.isCancelled))),
      "open_order_count",
      "number",
    ),
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

export default datatable(overview);
