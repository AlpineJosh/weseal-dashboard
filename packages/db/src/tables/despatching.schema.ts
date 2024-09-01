import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  real,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { component } from "./component.schema";
import { batch } from "./inventory.schema";

export const customer = pgTable("customer", {
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

export const customerRelations = relations(customer, ({ many }) => ({
  orders: many(salesOrder),
}));

export const salesOrder = pgTable("sales_order", {
  id: integer("id").primaryKey(),
  customerId: varchar("customer_id")
    .notNull()
    .references(() => customer.id),
  orderDate: timestamp("order_date"),
  isQuote: boolean("is_quote").notNull().default(false),
  isCancelled: boolean("is_cancelled").notNull().default(false),
  isComplete: boolean("is_complete").notNull().default(false),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

export const salesOrderRelations = relations(salesOrder, ({ one, many }) => ({
  customer: one(customer, {
    fields: [salesOrder.customerId],
    references: [customer.id],
  }),
  items: many(salesOrderItem),
  despatches: many(salesDespatch),
}));

export const salesOrderItem = pgTable("sales_order_item", {
  id: integer("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => salesOrder.id),
  componentId: varchar("component_id")
    .notNull()
    .references(() => component.id),
  quantityOrdered: real("quantity_ordered").notNull(),
  sageQuantityDespatched: real("sage_quantity_despatched").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

export const salesOrderItemRelations = relations(salesOrderItem, ({ one }) => ({
  order: one(salesOrder, {
    fields: [salesOrderItem.orderId],
    references: [salesOrder.id],
  }),
  component: one(component, {
    fields: [salesOrderItem.componentId],
    references: [component.id],
  }),
}));

export const salesDespatch = pgTable("sales_despatch", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => salesOrder.id),
  expectedDespatchDate: timestamp("expected_despatch_date"),
  despatchDate: timestamp("despatch_date"),
  isDespatched: boolean("is_despatched").notNull().default(false),
  isCancelled: boolean("is_cancelled").notNull().default(false),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const salesDespatchRelations = relations(salesDespatch, ({ one }) => ({
  order: one(salesOrder, {
    fields: [salesDespatch.orderId],
    references: [salesOrder.id],
  }),
}));

export const salesDespatchItem = pgTable("sales_despatch_item", {
  id: serial("id").primaryKey(),
  despatchId: integer("despatch_id")
    .notNull()
    .references(() => salesDespatch.id),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batch.id),
  quantity: real("quantity").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const salesDespatchItemRelations = relations(
  salesDespatchItem,
  ({ one }) => ({
    despatch: one(salesDespatch, {
      fields: [salesDespatchItem.despatchId],
      references: [salesDespatch.id],
    }),
    batch: one(batch, {
      fields: [salesDespatchItem.batchId],
      references: [batch.id],
    }),
  }),
);
