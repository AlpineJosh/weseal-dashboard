import { and, count, eq, ne, publicSchema, sql, sum } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatables";
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
    quantity: coalesce(sum(purchaseReceiptItem.quantity), 0)
      .mapWith(purchaseReceiptItem.quantity)
      .as("quantity"),
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
    totalItems: count().as("total_items"),
    incompleteItems: count(
      ne(
        coalesce(purchaseOrderItem.quantityOrdered, 0),
        coalesce(receiptItems.quantity, 0),
      ),
    ).as("incomplete_items"),
  })
  .from(purchaseOrderItem)
  .leftJoin(receiptItems, eq(purchaseOrderItem.orderId, receiptItems.orderId))
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
    isOpen: sql<boolean>`${and(
      eq(purchaseOrder.isQuote, false),
      eq(purchaseOrder.isCancelled, false),
      eq(purchaseOrder.isComplete, false),
    )}`.as("is_open"),
    createdAt: purchaseOrder.createdAt,
    lastModified: purchaseOrder.lastModified,
    totalItems: coalesce(items.totalItems, 0).as("total_items"),
    incompleteItems: coalesce(items.incompleteItems, 0).as("incomplete_items"),
  })
  .from(purchaseOrder)
  .leftJoin(supplier, eq(purchaseOrder.supplierId, supplier.id))
  .leftJoin(items, eq(purchaseOrder.id, items.orderId))
  .as("overview");

export default datatable(
  {
    id: "number",
    supplierId: "string",
    supplierName: "string",
    orderDate: "string",
    isQuote: "boolean",
    isCancelled: "boolean",
    isComplete: "boolean",
    isOpen: "boolean",
    createdAt: "string",
    lastModified: "string",
    totalItems: "number",
    incompleteItems: "number",
  },
  overview,
);
