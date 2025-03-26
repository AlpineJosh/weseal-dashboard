import { beforeEach, describe, expect, it, vi } from "vitest";

import { eq, schema } from "@repo/db";

import type { Transaction } from "@/db";
import { getSubcomponents } from "./component";

describe("getSubcomponents", () => {
  const mockTx = {
    query: {
      component: {
        findFirst: vi.fn(),
      },
      subcomponent: {
        findMany: vi.fn(),
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch subcomponents for a regular component", async () => {
    // Setup
    const componentId = "comp-123";
    const expectedSubcomponents = [
      { id: "sub-1", componentId: "comp-123" },
      { id: "sub-2", componentId: "comp-123" },
    ];

    mockTx.query.component.findFirst.mockResolvedValue(null);
    mockTx.query.subcomponent.findMany.mockResolvedValue(expectedSubcomponents);

    // Execute
    const result = await getSubcomponents(
      mockTx as unknown as Transaction,
      componentId,
    );

    // Assert
    expect(mockTx.query.component.findFirst).toHaveBeenCalledWith({
      where: eq(schema.component.id, "comp-123WIP"),
    });
    expect(mockTx.query.subcomponent.findMany).toHaveBeenCalledWith({
      where: eq(schema.subcomponent.componentId, "comp-123"),
    });
    expect(result).toEqual(expectedSubcomponents);
  });

  it("should fetch subcomponents for a WIP component", async () => {
    // Setup
    const componentId = "comp-123";
    const wipComponentId = "comp-123WIP";
    const expectedSubcomponents = [
      { id: "sub-1", componentId: wipComponentId },
      { id: "sub-2", componentId: wipComponentId },
    ];

    mockTx.query.component.findFirst.mockResolvedValue({ id: wipComponentId });
    mockTx.query.subcomponent.findMany.mockResolvedValue(expectedSubcomponents);

    // Execute
    const result = await getSubcomponents(
      mockTx as unknown as Transaction,
      componentId,
    );

    // Assert
    expect(mockTx.query.component.findFirst).toHaveBeenCalledWith({
      where: eq(schema.component.id, "comp-123WIP"),
    });
    expect(mockTx.query.subcomponent.findMany).toHaveBeenCalledWith({
      where: eq(schema.subcomponent.componentId, wipComponentId),
    });
    expect(result).toEqual(expectedSubcomponents);
  });
});
