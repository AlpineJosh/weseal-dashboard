import type { Decimal } from "decimal.js";

import { schema } from "@repo/db";

import type { Transaction } from "@/db";
import type { InventoryReference } from "@/models/inventory/types";

interface CreateSalesDespatchItemParams {
  despatchId: number;
  reference: InventoryReference;
  quantity: Decimal;
}

export const createSalesDespatchItem = async (
  tx: Transaction,
  params: CreateSalesDespatchItemParams,
) => {
  const { despatchId, reference, quantity } = params;

  const despatchItems = await tx
    .insert(schema.salesDespatchItem)
    .values({
      despatchId: despatchId,
      componentId: reference.componentId,
      batchId: reference.batchId,
      quantity: quantity,
    })
    .returning({
      id: schema.salesDespatchItem.id,
    });

  const despatchItem = despatchItems[0];
  if (!despatchItem) {
    throw new Error("Failed to create despatch item");
  }

  return despatchItem.id;
};
