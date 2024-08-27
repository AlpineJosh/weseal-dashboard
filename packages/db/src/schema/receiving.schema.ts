import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  real,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { component } from "./component.schema";
import { batch } from "./inventory.schema";

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
  orderDate: timestamp("order_date"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
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
  quantityOrdered: real("quantity_ordered"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
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
  id: integer("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => purchaseOrder.id),
  expectedReceiptDate: timestamp("expected_receipt_date"),
  receiptDate: timestamp("receipt_date"),
  isReceived: boolean("is_received").notNull().default(false),
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
  id: integer("id").primaryKey(),
  receiptId: integer("receipt_id")
    .notNull()
    .references(() => purchaseReceipt.id),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batch.id),
  quantity: real("quantity"),
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
    batch: one(batch, {
      fields: [purchaseReceiptItem.batchId],
      references: [batch.id],
    }),
  }),
);
