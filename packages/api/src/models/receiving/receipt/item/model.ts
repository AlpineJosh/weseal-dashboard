import { eq, publicSchema } from "@repo/db";

import { db } from "../../../../db";
import { datatable } from "../../../../lib/datatables";

const { purchaseReceiptItem, component, batch } = publicSchema;

const overview = db
  .select({
    id: purchaseReceiptItem.id,
    receiptId: purchaseReceiptItem.receiptId,
    componentId: purchaseReceiptItem.componentId,
    quantity: purchaseReceiptItem.quantity,
    componentDescription: component.description,
    componentUnit: component.unit,
    batchReference: batch.batchReference,
    createdAt: purchaseReceiptItem.createdAt,
    lastModified: purchaseReceiptItem.lastModified,
  })
  .from(purchaseReceiptItem)
  .leftJoin(component, eq(purchaseReceiptItem.componentId, component.id))
  .as("overview");

export default datatable(overview);
