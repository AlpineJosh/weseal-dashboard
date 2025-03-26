import type { Decimal } from "decimal.js";

import type { Schema } from "@repo/db";

import type { Nullable } from "../../core/types";

export type LedgerDirection = "inbound" | "outbound";

export interface InventoryReference {
  componentId: string;
  batchId: Nullable<number>;
}

export interface InventoryQuantities {
  totalQuantity: Decimal;
  allocatedQuantity: Decimal;
  freeQuantity: Decimal;
}

export type InventoryOperationType =
  | "inbound"
  | "outbound"
  | "allocation"
  | "deallocation";

export type AdjustmentType = "correction" | "wastage" | "lost" | "found";

export interface LedgerEntryDetails {
  userId: string;
  type: Schema["transactionType"]["enumValues"][number];
  salesDespatchItemId?: number;
  productionJobAllocationId?: number;
}

export interface InventoryLotEntry {
  id: number;
  quantity: Decimal;
}

export interface InventoryEntry {
  reference: InventoryReference;
  locationId: number;
  quantity: Decimal;
  lots: InventoryLotEntry[];
}

export type InboundSource =
  | { type: "purchase"; purchaseReceiptItemId: number }
  | { type: "production"; productionJobId: number }
  | { type: "adjustment" };
