import type Decimal from "decimal.js";

import { schema } from "@repo/db";

import type { Transaction } from "@/db";
import type { InventoryReference } from "@/models/inventory/types";
import { expectSingleRow } from "@/lib/utils";
import { processReceiptItem } from "@/models/receiving/receipt-item";

export interface ProcessReceiptParams {
  orderId: number;
  locationId: number;
  userId: string;
  items: {
    reference: InventoryReference;
    quantity: Decimal;
  }[];
}

export const processReceipt = async (
  tx: Transaction,
  { orderId, locationId, userId, items }: ProcessReceiptParams,
) => {
  const receipts = await tx
    .insert(schema.purchaseReceipt)
    .values({
      orderId,
      receiptDate: new Date(),
    })
    .returning();

  const receipt = expectSingleRow(
    receipts,
    "Failed to create purchase receipt",
  );

  for (const item of items) {
    await processReceiptItem(tx, {
      ...item,
      receiptId: receipt.id,
      locationId,
      entryDate: new Date(),
      userId,
    });
  }
};
