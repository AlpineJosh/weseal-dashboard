import type { Transaction } from "#db";

import { schema } from "@repo/db";

import type { CreateSalesOrderInput, CreateSalesOrderItemInput } from "./types";

export async function createSalesOrder(
  tx: Transaction,
  input: CreateSalesOrderInput,
) {
  const result = await tx.insert(schema.salesOrder).values(input).returning();
  return result[0];
}

export async function createSalesOrderItem(
  tx: Transaction,
  input: CreateSalesOrderItemInput,
) {
  const result = await tx
    .insert(schema.salesOrderItem)
    .values(input)
    .returning();
  return result[0];
}
