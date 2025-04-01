import type { Decimal } from "decimal.js";

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

export type CreatePurchaseOrderInput = Omit<
  PurchaseOrder,
  "id" | "createdAt" | "lastModified"
>;
export type CreatePurchaseOrderItemInput = Omit<
  PurchaseOrderItem,
  "id" | "createdAt" | "lastModified"
>;
