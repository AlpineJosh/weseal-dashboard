import { db } from "#db";
import { datatable } from "#lib/datatables";

import { eq, publicSchema } from "@repo/db";

const { purchaseReceiptItem, component } = publicSchema;

const overview = db
  .select({
    id: purchaseReceiptItem.id,
    receiptId: purchaseReceiptItem.receiptId,
    componentId: purchaseReceiptItem.componentId,
    quantity: purchaseReceiptItem.quantity,
    componentDescription: component.description,
    componentUnit: component.unit,
    componentStockTracked: component.isStockTracked,
    componentBatchTracked: component.isBatchTracked,
    createdAt: purchaseReceiptItem.createdAt,
    lastModified: purchaseReceiptItem.lastModified,
  })
  .from(purchaseReceiptItem)
  .leftJoin(component, eq(purchaseReceiptItem.componentId, component.id))
  .as("overview");

export const receiptItemQuery = datatable(
  {
    id: "number",
    receiptId: "number",
    componentId: "string",
    quantity: "decimal",
    componentDescription: "string",
    componentUnit: "string",
    componentStockTracked: "boolean",
    componentBatchTracked: "boolean",
    createdAt: "string",
    lastModified: "string",
  },
  overview,
);
