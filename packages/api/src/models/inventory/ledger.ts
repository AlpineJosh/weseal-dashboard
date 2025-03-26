import type Decimal from "decimal.js";

import { schema } from "@repo/db";

import type {
  InventoryEntry,
  InventoryLotEntry,
  InventoryReference,
  LedgerDirection,
  LedgerEntryDetails,
} from "./types";
import type { Transaction } from "@/db";

interface CreateLedgerEntryParams {
  reference: InventoryReference;
  locationId: number;
  quantity: Decimal;
  direction: LedgerDirection;
  details: LedgerEntryDetails;
}

export const createLedgerEntry = async (
  tx: Transaction,
  params: CreateLedgerEntryParams,
) => {
  const { reference, locationId, quantity, direction, details } = params;

  return tx
    .insert(schema.inventoryLedger)
    .values({
      componentId: reference.componentId,
      batchId: reference.batchId,
      locationId,
      quantity: direction === "inbound" ? quantity : quantity.negated(),
      ...details,
    })
    .returning();
};

interface CreateLotLedgerEntriesParams {
  lots: InventoryLotEntry[];
  locationId: number;
  direction: LedgerDirection;
  details: LedgerEntryDetails;
}

export const createLotLedgerEntries = async (
  tx: Transaction,
  params: CreateLotLedgerEntriesParams,
) => {
  const { lots, locationId, direction, details } = params;

  return tx
    .insert(schema.inventoryLotLedger)
    .values(
      lots.map((lot) => ({
        componentLotId: lot.id,
        locationId,
        quantity:
          direction === "inbound" ? lot.quantity : lot.quantity.negated(),
        ...details,
      })),
    )
    .returning();
};

export interface LogToLedgerParams {
  direction: LedgerDirection;
  entry: InventoryEntry;
  details: LedgerEntryDetails;
}

export const logToLedger = async (
  tx: Transaction,
  params: LogToLedgerParams,
) => {
  const { direction, entry, details } = params;

  await Promise.all([
    createLedgerEntry(tx, {
      reference: entry.reference,
      locationId: entry.locationId,
      quantity: entry.quantity,
      direction,
      details,
    }),

    createLotLedgerEntries(tx, {
      lots: entry.lots,
      locationId: entry.locationId,
      direction,
      details,
    }),
  ]);
};
