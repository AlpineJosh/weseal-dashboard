import type { Decimal } from "decimal.js";

export interface SalesOrder {
  id: number;
  customerId: string;
  orderDate: Date;
  isQuote: boolean;
  isCancelled: boolean;
  isComplete: boolean;
  createdAt: Date;
  lastModified: Date;
  isDeleted: boolean;
}

export interface SalesOrderItem {
  id: number;
  orderId: number;
  componentId: string;
  quantityOrdered: Decimal;
  sageQuantityDespatched: Decimal;
  createdAt: Date;
  lastModified: Date;
  isDeleted: boolean;
}

export type CreateSalesOrderInput = Omit<
  SalesOrder,
  "id" | "createdAt" | "lastModified"
>;
export type CreateSalesOrderItemInput = Omit<
  SalesOrderItem,
  "id" | "createdAt" | "lastModified"
>;
