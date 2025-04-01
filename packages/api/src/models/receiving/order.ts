import type { Transaction } from "#db";

import { schema } from "@repo/db";

import type {
  CreatePurchaseOrderInput,
  CreatePurchaseOrderItemInput,
} from "./types";

export async function createPurchaseOrder(
  tx: Transaction,
  input: CreatePurchaseOrderInput,
) {
  const result = await tx
    .insert(schema.purchaseOrder)
    .values(input)
    .returning();
  return result[0];
}

export async function createPurchaseOrderItem(
  tx: Transaction,
  input: CreatePurchaseOrderItemInput,
) {
  const result = await tx
    .insert(schema.purchaseOrderItem)
    .values(input)
    .returning();
  return result[0];
}
