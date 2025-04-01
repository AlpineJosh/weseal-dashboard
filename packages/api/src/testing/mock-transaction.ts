import type { Transaction } from "#db";
import { vi } from "vitest";

export class MockTransaction {
  insert = vi.fn().mockReturnThis();
  values = vi.fn().mockReturnThis();
  returning = vi.fn().mockReturnThis();
  select = vi.fn().mockReturnThis();
  from = vi.fn().mockReturnThis();
  where = vi.fn().mockReturnThis();
  limit = vi.fn().mockReturnThis();
  update = vi.fn().mockReturnThis();
  set = vi.fn().mockReturnThis();
  onConflictDoUpdate = vi.fn().mockReturnThis();
  leftJoin = vi.fn().mockReturnThis();
  orderBy = vi.fn().mockReturnThis();

  constructor() {
    // Allow chaining by default
    this.insert.mockReturnThis();
    this.values.mockReturnThis();
    this.returning.mockReturnThis();
    this.select.mockReturnThis();
    this.from.mockReturnThis();
    this.where.mockReturnThis();
    this.limit.mockReturnThis();
    this.update.mockReturnThis();
    this.leftJoin.mockReturnThis();
    this.orderBy.mockReturnThis();
    this.set.mockReturnThis();
    this.onConflictDoUpdate.mockReturnThis();
  }

  /**
   * Reset all mocks to their default state
   */
  reset() {
    vi.clearAllMocks();
    this.insert.mockReturnThis();
    this.values.mockReturnThis();
    this.returning.mockReturnThis();
    this.select.mockReturnThis();
    this.from.mockReturnThis();
    this.where.mockReturnThis();
    this.limit.mockReturnThis();
    this.update.mockReturnThis();
    this.set.mockReturnThis();
    this.onConflictDoUpdate.mockReturnThis();
    this.leftJoin.mockReturnThis();
    this.orderBy.mockReturnThis();
  }

  /**
   * Set a mock return value for a specific method
   */
  mockReturn<T>(method: keyof MockTransaction, value: T) {
    const mockFn = this[method] as unknown as jest.Mock;
    mockFn.mockReturnValue(value);
    return this;
  }

  /**
   * Set a mock resolved value for a specific method
   */
  mockResolve<T>(method: keyof MockTransaction, value: T) {
    const mockFn = this[method] as unknown as jest.Mock;
    mockFn.mockResolvedValue(value);
    return this;
  }

  /**
   * Set a mock rejected value for a specific method
   */
  mockReject(method: keyof MockTransaction, error: Error) {
    const mockFn = this[method] as unknown as jest.Mock;
    mockFn.mockRejectedValue(error);
    return this;
  }

  /**
   * Get the mock transaction as a Transaction type
   */
  asTx(): Transaction {
    return this as unknown as Transaction;
  }
}

/**
 * Create a new mock transaction
 */
export const createMockTransaction = () => new MockTransaction();
