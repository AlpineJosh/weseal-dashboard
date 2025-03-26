import type { Transaction } from "#db";
import type { InventoryReference } from "#models/inventory/types";
import type Decimal from "decimal.js";
import { expectSingleRow } from "#lib/utils";
import { updateInventory } from "#models/inventory/inventory";
import { logToLedger } from "#models/inventory/ledger";
import { createInboundEntry } from "#models/inventory/lots";

import { schema } from "@repo/db";

export interface ProcessReceiptItemParams {
  receiptId: number;
  reference: InventoryReference;
  locationId: number;
  quantity: Decimal;
  entryDate: Date;
  userId: string;
}

export const processReceiptItem = async (
  tx: Transaction,
  {
    receiptId,
    reference,
    locationId,
    quantity,
    entryDate,
    userId,
  }: ProcessReceiptItemParams,
) => {
  if (quantity.lte(0)) {
    throw new Error("Receipt quantity must be greater than 0");
  }

  const items = await tx
    .insert(schema.purchaseReceiptItem)
    .values({
      receiptId,
      componentId: reference.componentId,
      quantity,
    })
    .returning();

  const item = expectSingleRow(items, "Failed to create purchase receipt item");

  const entry = await createInboundEntry(tx, {
    reference,
    locationId,
    quantity,
    entryDate,
    source: {
      type: "purchase",
      purchaseReceiptItemId: item.id,
    },
  });

  await updateInventory(tx, {
    entry,
    type: "inbound",
  });

  await logToLedger(tx, {
    direction: "inbound",
    entry,
    details: {
      userId,
      type: "receipt",
    },
  });
};
