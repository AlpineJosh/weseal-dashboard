import { eq, publicSchema } from "@repo/db";

import { db } from "../../../../db";
import { datatable } from "../../../../lib/datatables";

const { purchaseReceiptItem, component } = publicSchema;

const overview = db
  .select({
    id: purchaseReceiptItem.id,
    receiptId: purchaseReceiptItem.receiptId,
    componentId: purchaseReceiptItem.componentId,
    quantity: purchaseReceiptItem.quantity,
    componentDescription: component.description,
    componentUnit: component.unit,
    createdAt: purchaseReceiptItem.createdAt,
    lastModified: purchaseReceiptItem.lastModified,
  })
  .from(purchaseReceiptItem)
  .leftJoin(component, eq(purchaseReceiptItem.componentId, component.id))
  .as("overview");

export default datatable(
  {
    id: "number",
    receiptId: "number",
    componentId: "string",
    quantity: "decimal",
    componentDescription: "string",
    componentUnit: "string",
    createdAt: "string",
    lastModified: "string",
  },
  overview,
);
