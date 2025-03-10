import { count, eq, publicSchema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatables";

const { salesDespatch, salesOrder, customer, salesDespatchItem } = publicSchema;

const despatchItems = db
  .select({
    despatchId: salesDespatchItem.despatchId,
    itemCount: count().as("item_count"),
  })
  .from(salesDespatchItem)
  .leftJoin(salesDespatch, eq(salesDespatchItem.despatchId, salesDespatch.id))
  .groupBy(salesDespatchItem.despatchId)
  .as("despatch_items");

const overview = db
  .select({
    id: salesDespatch.id,
    orderId: salesDespatch.orderId,
    despatchDate: salesDespatch.despatchDate,
    isDespatched: salesDespatch.isDespatched,
    isCancelled: salesDespatch.isCancelled,
    customerId: salesOrder.customerId,
    customerName: customer.name,
    itemCount: despatchItems.itemCount,
  })
  .from(salesDespatch)
  .leftJoin(salesOrder, eq(salesDespatch.orderId, salesOrder.id))
  .leftJoin(customer, eq(salesOrder.customerId, customer.id))
  .leftJoin(despatchItems, eq(salesDespatch.id, despatchItems.despatchId))
  .as("overview");

export default datatable(
  {
    id: "number",
    orderId: "number",
    despatchDate: "date",
    isDespatched: "boolean",
    isCancelled: "boolean",
    customerId: "string",
    customerName: "string",
    itemCount: "number",
  },
  overview,
);
