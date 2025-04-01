import { createMockTransaction } from "#testing/mock-transaction";
import Decimal from "decimal.js";
import { beforeEach, describe, expect, it } from "vitest";

import { schema } from "@repo/db";

import type { LedgerDirection } from "../types";
import {
  createLedgerEntry,
  createLotLedgerEntries,
  logToLedger,
} from "../ledger";

type TransactionType =
  | "receipt"
  | "despatch"
  | "transfer"
  | "production"
  | "correction"
  | "wastage"
  | "lost"
  | "found";

interface InventoryLedgerEntry {
  id: number;
  componentId: string;
  batchId: number | null;
  locationId: number;
  quantity: Decimal;
  userId: string;
  type: TransactionType;
  createdAt: Date;
  lastModified: Date;
}

interface InventoryLotLedgerEntry {
  id: number;
  componentLotId: number;
  locationId: number;
  quantity: Decimal;
  userId: string;
  type: TransactionType;
  createdAt: Date;
  lastModified: Date;
}

describe("createLedgerEntry", () => {
  const mockTx = createMockTransaction();

  beforeEach(() => {
    mockTx.reset();
  });

  it("should create inbound ledger entry with positive quantity", async () => {
    const mockResult: InventoryLedgerEntry[] = [
      {
        id: 1,
        componentId: "comp1",
        batchId: null,
        locationId: 1,
        quantity: new Decimal(10),
        userId: "user1",
        type: "receipt",
        createdAt: new Date(),
        lastModified: new Date(),
      },
    ];

    mockTx.mockResolve("returning", mockResult);

    const params = {
      reference: { componentId: "comp1", batchId: null },
      locationId: 1,
      quantity: new Decimal(10),
      direction: "inbound" as LedgerDirection,
      details: {
        userId: "user1",
        type: "receipt" as TransactionType,
      },
    };

    const result = await createLedgerEntry(mockTx.asTx(), params);

    expect(mockTx.insert).toHaveBeenCalledWith(schema.inventoryLedger);
    expect(mockTx.values).toHaveBeenCalledWith({
      componentId: "comp1",
      batchId: null,
      locationId: 1,
      quantity: new Decimal(10),
      userId: "user1",
      type: "receipt",
    });
    expect(result).toEqual(mockResult);
  });

  it("should create outbound ledger entry with negative quantity", async () => {
    const mockResult: InventoryLedgerEntry[] = [
      {
        id: 1,
        componentId: "comp1",
        batchId: null,
        locationId: 1,
        quantity: new Decimal(-10),
        userId: "user1",
        type: "despatch",
        createdAt: new Date(),
        lastModified: new Date(),
      },
    ];

    mockTx.mockResolve("returning", mockResult);

    const params = {
      reference: { componentId: "comp1", batchId: null },
      locationId: 1,
      quantity: new Decimal(10),
      direction: "outbound" as LedgerDirection,
      details: {
        userId: "user1",
        type: "despatch" as TransactionType,
      },
    };

    const result = await createLedgerEntry(mockTx.asTx(), params);

    expect(mockTx.insert).toHaveBeenCalledWith(schema.inventoryLedger);
    expect(mockTx.values).toHaveBeenCalledWith({
      componentId: "comp1",
      batchId: null,
      locationId: 1,
      quantity: new Decimal(-10),
      userId: "user1",
      type: "despatch",
    });
    expect(result).toEqual(mockResult);
  });
});

describe("createLotLedgerEntries", () => {
  const mockTx = createMockTransaction();

  beforeEach(() => {
    mockTx.reset();
  });

  it("should create inbound lot ledger entries with positive quantities", async () => {
    const mockResult: InventoryLotLedgerEntry[] = [
      {
        id: 1,
        componentLotId: 1,
        locationId: 1,
        quantity: new Decimal(5),
        userId: "user1",
        type: "receipt",
        createdAt: new Date(),
        lastModified: new Date(),
      },
      {
        id: 2,
        componentLotId: 2,
        locationId: 1,
        quantity: new Decimal(5),
        userId: "user1",
        type: "receipt",
        createdAt: new Date(),
        lastModified: new Date(),
      },
    ];

    mockTx.mockResolve("returning", mockResult);

    const params = {
      lots: [
        { id: 1, quantity: new Decimal(5) },
        { id: 2, quantity: new Decimal(5) },
      ],
      locationId: 1,
      direction: "inbound" as LedgerDirection,
      details: {
        userId: "user1",
        type: "receipt" as TransactionType,
      },
    };

    const result = await createLotLedgerEntries(mockTx.asTx(), params);

    expect(mockTx.insert).toHaveBeenCalledWith(schema.inventoryLotLedger);
    expect(mockTx.values).toHaveBeenCalledWith([
      {
        componentLotId: 1,
        locationId: 1,
        quantity: new Decimal(5),
        userId: "user1",
        type: "receipt",
      },
      {
        componentLotId: 2,
        locationId: 1,
        quantity: new Decimal(5),
        userId: "user1",
        type: "receipt",
      },
    ]);
    expect(result).toEqual(mockResult);
  });

  it("should create outbound lot ledger entries with negative quantities", async () => {
    const mockResult: InventoryLotLedgerEntry[] = [
      {
        id: 1,
        componentLotId: 1,
        locationId: 1,
        quantity: new Decimal(-5),
        userId: "user1",
        type: "despatch",
        createdAt: new Date(),
        lastModified: new Date(),
      },
      {
        id: 2,
        componentLotId: 2,
        locationId: 1,
        quantity: new Decimal(-5),
        userId: "user1",
        type: "despatch",
        createdAt: new Date(),
        lastModified: new Date(),
      },
    ];

    mockTx.mockResolve("returning", mockResult);

    const params = {
      lots: [
        { id: 1, quantity: new Decimal(5) },
        { id: 2, quantity: new Decimal(5) },
      ],
      locationId: 1,
      direction: "outbound" as LedgerDirection,
      details: {
        userId: "user1",
        type: "despatch" as TransactionType,
      },
    };

    const result = await createLotLedgerEntries(mockTx.asTx(), params);

    expect(mockTx.insert).toHaveBeenCalledWith(schema.inventoryLotLedger);
    expect(mockTx.values).toHaveBeenCalledWith([
      {
        componentLotId: 1,
        locationId: 1,
        quantity: new Decimal(-5),
        userId: "user1",
        type: "despatch",
      },
      {
        componentLotId: 2,
        locationId: 1,
        quantity: new Decimal(-5),
        userId: "user1",
        type: "despatch",
      },
    ]);
    expect(result).toEqual(mockResult);
  });
});

describe("logToLedger", () => {
  const mockTx = createMockTransaction();

  beforeEach(() => {
    mockTx.reset();
  });

  it("should log both inventory and lot ledger entries", async () => {
    const mockInventoryResult: InventoryLedgerEntry[] = [
      {
        id: 1,
        componentId: "comp1",
        batchId: null,
        locationId: 1,
        quantity: new Decimal(10),
        userId: "user1",
        type: "receipt",
        createdAt: new Date(),
        lastModified: new Date(),
      },
    ];

    const mockLotResult: InventoryLotLedgerEntry[] = [
      {
        id: 1,
        componentLotId: 1,
        locationId: 1,
        quantity: new Decimal(5),
        userId: "user1",
        type: "receipt",
        createdAt: new Date(),
        lastModified: new Date(),
      },
      {
        id: 2,
        componentLotId: 2,
        locationId: 1,
        quantity: new Decimal(5),
        userId: "user1",
        type: "receipt",
        createdAt: new Date(),
        lastModified: new Date(),
      },
    ];

    mockTx
      .mockResolve("returning", mockInventoryResult)
      .mockResolve("returning", mockLotResult);

    const params = {
      direction: "inbound" as LedgerDirection,
      entry: {
        reference: { componentId: "comp1", batchId: null },
        locationId: 1,
        quantity: new Decimal(10),
        lots: [
          { id: 1, quantity: new Decimal(5) },
          { id: 2, quantity: new Decimal(5) },
        ],
      },
      details: {
        userId: "user1",
        type: "receipt" as TransactionType,
      },
    };

    await logToLedger(mockTx.asTx(), params);

    expect(mockTx.insert).toHaveBeenCalledTimes(2);
    expect(mockTx.values).toHaveBeenCalledTimes(2);
  });

  it("should handle empty lots array", async () => {
    const mockInventoryResult: InventoryLedgerEntry[] = [
      {
        id: 1,
        componentId: "comp1",
        batchId: null,
        locationId: 1,
        quantity: new Decimal(10),
        userId: "user1",
        type: "receipt",
        createdAt: new Date(),
        lastModified: new Date(),
      },
    ];

    mockTx.mockResolve("returning", mockInventoryResult);

    const params = {
      direction: "inbound" as LedgerDirection,
      entry: {
        reference: { componentId: "comp1", batchId: null },
        locationId: 1,
        quantity: new Decimal(10),
        lots: [],
      },
      details: {
        userId: "user1",
        type: "receipt" as TransactionType,
      },
    };

    await logToLedger(mockTx.asTx(), params);

    expect(mockTx.insert).toHaveBeenCalledTimes(1);
    expect(mockTx.values).toHaveBeenCalledTimes(1);
  });
});
