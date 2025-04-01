import type { Decimal } from "decimal.js";

import type { Schema } from "@repo/db";

export interface PurchaseOrder {
  id: number;
  supplierId: string;
  isQuote: boolean;
  isComplete: boolean;
  isCancelled: boolean;
  orderDate: Date;
  createdAt: Date;
  lastModified: Date;
  isDeleted: boolean;
}

export interface PurchaseOrderItem {
  id: number;
  orderId: number;
  componentId: string;
  quantityOrdered: Decimal;
  sageQuantityReceived: Decimal;
  createdAt: Date;
  lastModified: Date;
  isDeleted: boolean;
}

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

export type CreatePurchaseOrderInput = Omit<
  PurchaseOrder,
  "id" | "createdAt" | "lastModified"
>;
export type CreatePurchaseOrderItemInput = Omit<
  PurchaseOrderItem,
  "id" | "createdAt" | "lastModified"
>;
export type CreateSalesOrderInput = Omit<
  SalesOrder,
  "id" | "createdAt" | "lastModified"
>;
export type CreateSalesOrderItemInput = Omit<
  SalesOrderItem,
  "id" | "createdAt" | "lastModified"
>;
