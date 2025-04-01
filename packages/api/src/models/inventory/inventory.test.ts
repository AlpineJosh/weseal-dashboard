import type {
  AssignInboundEntryParams,
  CalculateOutboundEntryParams,
} from "#models/inventory/lots.js";
import { createTask } from "#models/task/task";
import { createMockTransaction } from "#testing/mock-transaction";
import Decimal from "decimal.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { schema, SQL } from "@repo/db";

import * as inventoryModule from "./inventory";
import {
  adjustInventory,
  calculateQuantityChanges,
  createTransferTask,
  updateInventory,
  updateInventoryQuantities,
} from "./inventory";

// Mock dependencies
vi.mock("#models/task/task", () => ({
  createTask: vi.fn(),
}));

vi.mock("#models/inventory/ledger", () => ({
  logToLedger: vi.fn(),
}));

vi.mock("#models/inventory/lots", () => ({
  calculateOutboundEntry: vi.fn(
    (_, { reference, locationId, quantity }: CalculateOutboundEntryParams) => ({
      reference,
      locationId,
      quantity,
      lots: [
        {
          id: 1,
          quantity: quantity.mul(0.1),
        },
        {
          id: 2,
          quantity: quantity.mul(0.9),
        },
      ],
    }),
  ),
  assignInboundEntry: vi.fn(
    (_, { reference, locationId, quantity }: AssignInboundEntryParams) => ({
      reference,
      locationId,
      quantity,
      lots: [
        {
          id: 1,
          quantity: quantity.mul(0.1),
        },
        {
          id: 2,
          quantity: quantity.mul(0.9),
        },
      ],
    }),
  ),
  updateLotQuantities: vi.fn(),
}));

describe("calculateQuantityChanges", () => {
  it("should calculate correct quantities for inbound operations", () => {
    const result = calculateQuantityChanges({
      quantity: new Decimal(10),
      type: "inbound",
    });

    expect(result.totalQuantity.equals(new Decimal(10))).toBe(true);
    expect(result.allocatedQuantity.equals(new Decimal(0))).toBe(true);
    expect(result.freeQuantity.equals(new Decimal(10))).toBe(true);
  });

  it("should calculate correct quantities for outbound operations", () => {
    const result = calculateQuantityChanges({
      quantity: new Decimal(10),
      type: "outbound",
    });

    expect(result.totalQuantity.equals(new Decimal(-10))).toBe(true);
    expect(result.allocatedQuantity.equals(new Decimal(0))).toBe(true);
    expect(result.freeQuantity.equals(new Decimal(-10))).toBe(true);
  });

  it("should calculate correct quantities for allocation operations", () => {
    const result = calculateQuantityChanges({
      quantity: new Decimal(10),
      type: "allocation",
    });

    expect(result.totalQuantity.equals(new Decimal(0))).toBe(true);
    expect(result.allocatedQuantity.equals(new Decimal(10))).toBe(true);
    expect(result.freeQuantity.equals(new Decimal(-10))).toBe(true);
  });

  it("should calculate correct quantities for deallocation operations", () => {
    const result = calculateQuantityChanges({
      quantity: new Decimal(10),
      type: "deallocation",
    });

    expect(result.totalQuantity.equals(new Decimal(0))).toBe(true);
    expect(result.allocatedQuantity.equals(new Decimal(-10))).toBe(true);
    expect(result.freeQuantity.equals(new Decimal(10))).toBe(true);
  });
});

describe("updateInventoryQuantities", () => {
  const mockTx = createMockTransaction();

  beforeEach(() => {
    mockTx.reset();
  });

  it("should insert new inventory record when none exists", async () => {
    const mockResult = [
      {
        id: 1,
        componentId: "comp1",
        batchId: null,
        locationId: 1,
        totalQuantity: new Decimal(10),
        allocatedQuantity: new Decimal(0),
        freeQuantity: new Decimal(10),
        entryDate: new Date(),
      },
    ];

    mockTx.mockResolve("returning", mockResult);

    const result = await updateInventoryQuantities(mockTx.asTx(), {
      reference: { componentId: "comp1", batchId: null },
      locationId: 1,
      quantities: {
        totalQuantity: new Decimal(10),
        allocatedQuantity: new Decimal(0),
        freeQuantity: new Decimal(10),
      },
    });

    expect(mockTx.insert).toHaveBeenCalledWith(schema.inventory);
    expect(mockTx.values).toHaveBeenCalled();
    expect(result).toEqual(mockResult[0]);
  });

  it("should update existing inventory record", async () => {
    const mockResult = [
      {
        id: 1,
        componentId: "comp1",
        batchId: null,
        locationId: 1,
        totalQuantity: new Decimal(20),
        allocatedQuantity: new Decimal(5),
        freeQuantity: new Decimal(15),
        entryDate: new Date(),
      },
    ];

    mockTx.mockResolve("returning", mockResult);

    const result = await updateInventoryQuantities(mockTx.asTx(), {
      reference: { componentId: "comp1", batchId: null },
      locationId: 1,
      quantities: {
        totalQuantity: new Decimal(10),
        allocatedQuantity: new Decimal(5),
        freeQuantity: new Decimal(5),
      },
    });

    expect(mockTx.onConflictDoUpdate).toHaveBeenCalled();
    expect(result).toEqual(mockResult[0]);
  });

  it("should throw error on negative quantities", async () => {
    const mockResult = [
      {
        id: 1,
        componentId: "comp1",
        batchId: null,
        locationId: 1,
        totalQuantity: new Decimal(-1),
        allocatedQuantity: new Decimal(0),
        freeQuantity: new Decimal(-1),
        entryDate: new Date(),
      },
    ];

    mockTx.mockResolve("returning", mockResult);

    await expect(
      updateInventoryQuantities(mockTx.asTx(), {
        reference: { componentId: "comp1", batchId: null },
        locationId: 1,
        quantities: {
          totalQuantity: new Decimal(-10),
          allocatedQuantity: new Decimal(0),
          freeQuantity: new Decimal(-10),
        },
      }),
    ).rejects.toThrow("Operation would result in negative quantities");
  });

  it("should construct correct SQL for quantity updates", async () => {
    const mockResult = [
      {
        id: 1,
        componentId: "comp1",
        batchId: null,
        locationId: 1,
        totalQuantity: new Decimal(20),
        allocatedQuantity: new Decimal(5),
        freeQuantity: new Decimal(15),
        entryDate: new Date(),
      },
    ];
    mockTx.mockResolve("returning", mockResult);

    await updateInventoryQuantities(mockTx.asTx(), {
      reference: { componentId: "comp1", batchId: null },
      locationId: 1,
      quantities: {
        totalQuantity: new Decimal(10),
        allocatedQuantity: new Decimal(5),
        freeQuantity: new Decimal(5),
      },
    });

    expect(mockTx.values).toHaveBeenCalledWith(
      expect.objectContaining({
        componentId: "comp1",
        batchId: null,
        locationId: 1,
        totalQuantity: new Decimal(10),
        allocatedQuantity: new Decimal(5),
        freeQuantity: new Decimal(5),
        entryDate: expect.any(Date),
      }),
    );
  });
});

describe("updateInventory", () => {
  const mockTx = createMockTransaction();

  beforeEach(() => {
    mockTx.reset();
    vi.spyOn(inventoryModule, "calculateQuantityChanges").mockReturnValue({
      totalQuantity: new Decimal(0),
      allocatedQuantity: new Decimal(0),
      freeQuantity: new Decimal(0),
    });
  });

  it("should throw error on negative quantity", async () => {
    await expect(
      updateInventory(mockTx.asTx(), {
        entry: {
          reference: { componentId: "comp1", batchId: null },
          locationId: 1,
          quantity: new Decimal(-10),
          lots: [],
        },
        type: "inbound",
      }),
    ).rejects.toThrow("Quantity must be greater than 0");
  });

  it("should update inventory and lot quantities", async () => {
    const mockResult = [
      {
        id: 1,
        componentId: "comp1",
        batchId: null,
        locationId: 1,
        totalQuantity: new Decimal(10),
        allocatedQuantity: new Decimal(0),
        freeQuantity: new Decimal(10),
        entryDate: new Date(),
      },
    ];

    mockTx.mockResolve("returning", mockResult);

    await updateInventory(mockTx.asTx(), {
      entry: {
        reference: { componentId: "comp1", batchId: null },
        locationId: 1,
        quantity: new Decimal(10),
        lots: [],
      },
      type: "inbound",
    });

    expect(mockTx.insert).toHaveBeenCalled();
    expect(mockTx.onConflictDoUpdate).toHaveBeenCalled();
  });
});

describe("adjustInventory", () => {
  const mockTx = createMockTransaction();

  beforeEach(() => {
    mockTx.reset();
    // Mock updateInventoryQuantities to return a valid result
    mockTx.mockResolve("returning", [
      {
        id: 1,
        componentId: "comp1",
        batchId: null,
        locationId: 1,
        totalQuantity: new Decimal(10),
        allocatedQuantity: new Decimal(0),
        freeQuantity: new Decimal(10),
        entryDate: new Date(),
      },
    ]);

    vi.spyOn(inventoryModule, "updateInventory").mockResolvedValue();
    vi.spyOn(inventoryModule, "calculateQuantityChanges").mockReturnValue({
      totalQuantity: new Decimal(0),
      allocatedQuantity: new Decimal(0),
      freeQuantity: new Decimal(0),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle positive adjustment (found inventory)", async () => {
    mockTx.mockResolve("limit", [
      {
        freeQuantity: new Decimal(5),
      },
    ]);

    await adjustInventory(mockTx.asTx(), {
      reference: { componentId: "comp1", batchId: null },
      locationId: 1,
      quantity: new Decimal(10),
      userId: "user1",
      type: "found",
    });

    expect(mockTx.insert).toHaveBeenCalledWith(schema.inventory);
    expect(mockTx.values).toHaveBeenCalled();
    expect(mockTx.onConflictDoUpdate).toHaveBeenCalled();
  });

  it("should handle negative adjustment (lost inventory)", async () => {
    mockTx.mockResolve("limit", [
      {
        freeQuantity: new Decimal(15),
      },
    ]);

    await adjustInventory(mockTx.asTx(), {
      reference: { componentId: "comp1", batchId: null },
      locationId: 1,
      quantity: new Decimal(10),
      userId: "user1",
      type: "lost",
    });

    expect(mockTx.insert).toHaveBeenCalledWith(schema.inventory);
    expect(mockTx.values).toHaveBeenCalled();
    expect(mockTx.onConflictDoUpdate).toHaveBeenCalled();
  });

  it("should skip adjustment when difference is zero", async () => {
    mockTx.mockResolve("limit", [
      {
        freeQuantity: new Decimal(10),
      },
    ]);

    await adjustInventory(mockTx.asTx(), {
      reference: { componentId: "comp1", batchId: null },
      locationId: 1,
      quantity: new Decimal(10),
      userId: "user1",
      type: "correction",
    });

    expect(mockTx.insert).not.toHaveBeenCalled();
    expect(mockTx.values).not.toHaveBeenCalled();
    expect(mockTx.onConflictDoUpdate).not.toHaveBeenCalled();
  });

  it("should handle wastage adjustment", async () => {
    mockTx.mockResolve("limit", [
      {
        freeQuantity: new Decimal(15),
      },
    ]);

    await adjustInventory(mockTx.asTx(), {
      reference: { componentId: "comp1", batchId: null },
      locationId: 1,
      quantity: new Decimal(10),
      userId: "user1",
      type: "wastage",
    });

    expect(mockTx.insert).toHaveBeenCalledWith(schema.inventory);
    expect(mockTx.values).toHaveBeenCalled();
    expect(mockTx.onConflictDoUpdate).toHaveBeenCalled();
  });

  it("should handle adjustment with batch ID", async () => {
    mockTx.mockResolve("limit", [
      {
        freeQuantity: new Decimal(5),
      },
    ]);

    await adjustInventory(mockTx.asTx(), {
      reference: { componentId: "comp1", batchId: 123 },
      locationId: 1,
      quantity: new Decimal(10),
      userId: "user1",
      type: "found",
    });

    // Verify correct batch handling
    expect(mockTx.where).toHaveBeenCalledWith(
      expect.objectContaining({
        batchId: SQL,
      }),
    );
  });

  it("should call logToLedger with correct parameters", async () => {
    const { logToLedger } = await import("#models/inventory/ledger");

    mockTx.mockResolve("limit", [
      {
        freeQuantity: new Decimal(5),
      },
    ]);

    await adjustInventory(mockTx.asTx(), {
      reference: { componentId: "comp1", batchId: null },
      locationId: 1,
      quantity: new Decimal(10),
      userId: "user1",
      type: "found",
    });

    expect(logToLedger).toHaveBeenCalledWith(
      mockTx.asTx(),
      expect.objectContaining({
        direction: "inbound",
        details: expect.objectContaining({
          type: "found",
          userId: "user1",
        }),
      }),
    );
  });
});

describe("createTransferTask", () => {
  const mockTx = createMockTransaction();

  beforeEach(() => {
    mockTx.reset();
    vi.spyOn(inventoryModule, "updateInventory").mockResolvedValue();
    vi.spyOn(inventoryModule, "calculateQuantityChanges").mockReturnValue({
      totalQuantity: new Decimal(0),
      allocatedQuantity: new Decimal(0),
      freeQuantity: new Decimal(0),
    });
  });

  it("should create a transfer task with allocations", async () => {
    const result = await createTransferTask(mockTx.asTx(), {
      assignedToId: "user1",
      createdById: "user2",
      allocations: [
        {
          reference: { componentId: "comp1", batchId: null },
          quantity: new Decimal(10),
          pickLocationId: 1,
          putLocationId: 2,
        },
      ],
    });

    expect(createTask).toHaveBeenCalledWith(mockTx.asTx(), {
      type: "transfer",
      assignedToId: "user1",
      createdById: "user2",
      allocations: [
        {
          reference: { componentId: "comp1", batchId: null },
          quantity: new Decimal(10),
          pickLocationId: 1,
          putLocationId: 2,
        },
      ],
    });
  });
});
