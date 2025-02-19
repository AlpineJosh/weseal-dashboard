import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { numericDecimal } from "../../lib/numeric";
import { component } from "./component.schema";

export const supplier = pgTable("supplier", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

export const supplierRelations = relations(supplier, ({ many }) => ({
  orders: many(purchaseOrder),
}));

export const purchaseOrder = pgTable("purchase_order", {
  id: integer("id").primaryKey(),
  supplierId: varchar("supplier_id")
    .notNull()
    .references(() => supplier.id),
  isQuote: boolean("is_quote").notNull().default(false),
  isComplete: boolean("is_complete").notNull().default(false),
  isCancelled: boolean("is_cancelled").notNull().default(false),
  orderDate: timestamp("order_date").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

export const purchaseOrderRelations = relations(
  purchaseOrder,
  ({ one, many }) => ({
    supplier: one(supplier, {
      fields: [purchaseOrder.supplierId],
      references: [supplier.id],
    }),
    items: many(purchaseOrderItem),
    receipts: many(purchaseReceipt),
  }),
);

export const purchaseOrderItem = pgTable("purchase_order_item", {
  id: integer("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => purchaseOrder.id),
  componentId: varchar("component_id")
    .notNull()
    .references(() => component.id),
  quantityOrdered: numericDecimal("quantity_ordered").notNull(),
  sageQuantityReceived: numericDecimal("sage_quantity_received").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

export const purchaseOrderItemRelations = relations(
  purchaseOrderItem,
  ({ one }) => ({
    order: one(purchaseOrder, {
      fields: [purchaseOrderItem.orderId],
      references: [purchaseOrder.id],
    }),
    component: one(component, {
      fields: [purchaseOrderItem.componentId],
      references: [component.id],
    }),
  }),
);

export const purchaseReceipt = pgTable("purchase_receipt", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => purchaseOrder.id),
  receiptDate: timestamp("receipt_date").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const purchaseReceiptRelations = relations(
  purchaseReceipt,
  ({ one, many }) => ({
    order: one(purchaseOrder, {
      fields: [purchaseReceipt.orderId],
      references: [purchaseOrder.id],
    }),
    items: many(purchaseReceiptItem),
  }),
);

export const purchaseReceiptItem = pgTable("purchase_receipt_item", {
  id: serial("id").primaryKey(),
  receiptId: integer("receipt_id")
    .notNull()
    .references(() => purchaseReceipt.id),
  componentId: varchar("component_id")
    .notNull()
    .references(() => component.id),
  quantity: numericDecimal("quantity").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const purchaseReceiptItemRelations = relations(
  purchaseReceiptItem,
  ({ one }) => ({
    receipt: one(purchaseReceipt, {
      fields: [purchaseReceiptItem.receiptId],
      references: [purchaseReceipt.id],
    }),
    component: one(component, {
      fields: [purchaseReceiptItem.componentId],
      references: [component.id],
    }),
  }),
);
