import { db } from "#db";
import { datatable } from "#lib/datatables";
import { coalesce } from "#lib/operators";

import { count, eq, publicSchema, sum } from "@repo/db";

const { purchaseReceipt, purchaseOrder, supplier, purchaseReceiptItem } =
  publicSchema;

const items = db
  .select({
    receiptId: purchaseReceiptItem.receiptId,
    itemCount: count().as("item_count"),
    totalQuantity: coalesce(sum(purchaseReceiptItem.quantity), 0).as(
      "total_quantity",
    ),
  })
  .from(purchaseReceiptItem)
  .groupBy(purchaseReceiptItem.receiptId)
  .as("items");

const overview = db
  .select({
    id: purchaseReceipt.id,
    orderId: purchaseReceipt.orderId,
    supplierId: purchaseOrder.supplierId,
    supplierName: supplier.name,
    receiptDate: purchaseReceipt.receiptDate,
    createdAt: purchaseReceipt.createdAt,
    lastModified: purchaseReceipt.lastModified,
    itemCount: items.itemCount,
    totalQuantity: items.totalQuantity,
  })
  .from(purchaseReceipt)
  .leftJoin(purchaseOrder, eq(purchaseReceipt.orderId, purchaseOrder.id))
  .leftJoin(supplier, eq(purchaseOrder.supplierId, supplier.id))
  .leftJoin(items, eq(items.receiptId, purchaseReceipt.id))
  .as("overview");

export const receiptQuery = datatable(
  {
    id: "number",
    orderId: "number",
    supplierId: "string",
    supplierName: "string",
    receiptDate: "date",
    createdAt: "date",
    lastModified: "date",
    itemCount: "number",
    totalQuantity: "number",
  },
  overview,
);
