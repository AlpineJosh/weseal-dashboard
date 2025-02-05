import type { SQL } from "@repo/db";
import { and, count, eq, ne, publicSchema, sum } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatables";
import { as } from "../../../lib/datatables/types";
import { coalesce } from "../../../lib/operators";

const {
  purchaseOrder,
  supplier,
  purchaseOrderItem,
  purchaseReceipt,
  purchaseReceiptItem,
} = publicSchema;

const receiptItems = db
  .select({
    orderId: purchaseReceipt.orderId,
    componentId: purchaseReceiptItem.componentId,
    quantity: as(
      coalesce(sum(purchaseReceiptItem.quantity), 0),
      "quantity",
      "number",
    ),
  })
  .from(purchaseReceiptItem)
  .leftJoin(
    purchaseReceipt,
    eq(purchaseReceiptItem.receiptId, purchaseReceipt.id),
  )
  .groupBy(purchaseReceipt.orderId, purchaseReceiptItem.componentId)
  .as("receiptItems");

const items = db
  .select({
    orderId: purchaseOrderItem.orderId,
    componentId: purchaseOrderItem.componentId,
    totalItems: as(count(), "total_items", "number"),
    incompleteItems: as(
      count(
        ne(
          coalesce(sum(purchaseOrderItem.quantityOrdered), 0),
          coalesce(sum(receiptItems.quantity), 0),
        ),
      ),
      "incomplete_items",
      "number",
    ),
  })
  .from(purchaseOrderItem)
  .groupBy(purchaseOrderItem.orderId)
  .as("items");

const overview = db
  .select({
    id: purchaseOrder.id,
    supplierId: purchaseOrder.supplierId,
    supplierName: supplier.name,
    orderDate: purchaseOrder.orderDate,
    isQuote: purchaseOrder.isQuote,
    isCancelled: purchaseOrder.isCancelled,
    isComplete: purchaseOrder.isComplete,
    isOpen: as(
      and(
        eq(purchaseOrder.isQuote, false),
        eq(purchaseOrder.isCancelled, false),
        eq(purchaseOrder.isComplete, false),
      ) as SQL<boolean>,
      "isOpen",
      "boolean",
    ),
    createdAt: purchaseOrder.createdAt,
    lastModified: purchaseOrder.lastModified,
    totalItems: items.totalItems,
    incompleteItems: items.incompleteItems,
  })
  .from(purchaseOrder)
  .leftJoin(supplier, eq(purchaseOrder.supplierId, supplier.id))
  .leftJoin(items, eq(purchaseOrder.id, items.orderId))
  .as("overview");

export default datatable(overview);
