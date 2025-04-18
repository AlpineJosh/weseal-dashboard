import { db } from "#db";
import { datatable } from "#lib/datatables";
import { coalesce } from "#lib/operators";

import { and, eq, publicSchema, sum } from "@repo/db";

const { purchaseOrderItem, component, purchaseReceipt, purchaseReceiptItem } =
  publicSchema;

const receipts = db
  .select({
    componentId: purchaseReceiptItem.componentId,
    orderId: purchaseReceipt.orderId,
    quantityReceived: coalesce(sum(purchaseReceiptItem.quantity), 0)
      .mapWith(purchaseReceiptItem.quantity)
      .as("quantity_received"),
  })
  .from(purchaseReceiptItem)
  .leftJoin(
    purchaseReceipt,
    eq(purchaseReceiptItem.receiptId, purchaseReceipt.id),
  )
  .groupBy(purchaseReceiptItem.componentId, purchaseReceipt.orderId)
  .as("receipts");

const overview = db
  .select({
    id: purchaseOrderItem.id,
    orderId: purchaseOrderItem.orderId,
    componentId: purchaseOrderItem.componentId,
    quantityOrdered: purchaseOrderItem.quantityOrdered,
    quantityReceived: coalesce(receipts.quantityReceived, 0)
      .mapWith(purchaseOrderItem.quantityOrdered)
      .as("quantity_received"),
    sageQuantityReceived: purchaseOrderItem.sageQuantityReceived,
    createdAt: purchaseOrderItem.createdAt,
    lastModified: purchaseOrderItem.lastModified,
    isDeleted: purchaseOrderItem.isDeleted,
    componentDescription: component.description,
    componentUnit: component.unit,
    componentStockTracked: component.isStockTracked,
    componentBatchTracked: component.isBatchTracked,
  })
  .from(purchaseOrderItem)
  .leftJoin(component, eq(purchaseOrderItem.componentId, component.id))
  .leftJoin(
    receipts,
    and(
      eq(purchaseOrderItem.orderId, receipts.orderId),
      eq(purchaseOrderItem.componentId, receipts.componentId),
    ),
  )
  .as("overview");

export const orderItemQuery = datatable(
  {
    id: "number",
    orderId: "number",
    componentId: "string",
    quantityOrdered: "decimal",
    quantityReceived: "decimal",
    sageQuantityReceived: "decimal",
    createdAt: "date",
    lastModified: "date",
    isDeleted: "boolean",
    componentDescription: "string",
    componentUnit: "string",
    componentStockTracked: "boolean",
    componentBatchTracked: "boolean",
  },
  overview,
);
