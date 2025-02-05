import { count, eq, publicSchema, sum } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatables";
import { as } from "../../../lib/datatables/types";
import { coalesce } from "../../../lib/operators";

const { purchaseReceipt, purchaseOrder, supplier, purchaseReceiptItem } =
  publicSchema;

const items = db
  .select({
    receiptId: purchaseReceiptItem.receiptId,
    itemCount: as(count(), "item_count", "number"),
    totalQuantity: as(
      coalesce(sum(purchaseReceiptItem.quantity), 0),
      "total_quantity",
      "number",
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

export default datatable(overview);
