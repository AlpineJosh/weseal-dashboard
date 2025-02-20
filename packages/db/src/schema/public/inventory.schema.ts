import type { SQL } from "drizzle-orm";
import { and, eq, ne, or, relations, sql } from "drizzle-orm";
import {
  date,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { numericDecimal } from "../../lib/numeric";
import { batch } from "./batch.schema";
import { component } from "./component.schema";
import { salesDespatchItem } from "./despatching.schema";
import { location } from "./location.schema";
import { productionJob, productionJobAllocation } from "./production.schema";
import { profile } from "./profile.schema";
import { purchaseReceiptItem } from "./receiving.schema";

export const transactionType = pgEnum("transaction_type", [
  "despatch",
  "receipt",
  "transfer",
  "production",
  "correction",
  "wastage",
  "lost",
  "found",
]);

export const componentLot = pgTable(
  "component_lot",
  {
    id: serial("id").notNull().primaryKey(),
    componentId: varchar("component_id")
      .notNull()
      .references(() => component.id),
    batchId: integer("batch_id").references(() => batch.id),
    entryDate: date("entry_date", { mode: "date" }).notNull(),
    purchaseReceiptItemId: integer("purchase_receipt_item_id").references(
      () => purchaseReceiptItem.id,
    ),
    productionJobId: integer("production_job_id").references(
      () => productionJob.id,
    ),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
    lastModified: timestamp("last_modified")
      .notNull()
      .default(sql`now()`)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    checkConstraint: {
      name: "component_lot_check",
      expression: or(
        and(
          ne(table.productionJobId, null),
          eq(table.purchaseReceiptItemId, null),
        ),
        and(
          ne(table.purchaseReceiptItemId, null),
          eq(table.productionJobId, null),
        ),
      ) as SQL<boolean>,
    },
  }),
);

export const componentLotRelations = relations(componentLot, ({ one }) => ({
  component: one(component, {
    fields: [componentLot.componentId],
    references: [component.id],
  }),
  batch: one(batch, {
    fields: [componentLot.batchId],
    references: [batch.id],
  }),
  purchaseReceiptItem: one(purchaseReceiptItem, {
    fields: [componentLot.purchaseReceiptItemId],
    references: [purchaseReceiptItem.id],
  }),
  productionJob: one(productionJob, {
    fields: [componentLot.productionJobId],
    references: [productionJob.id],
  }),
}));

export const inventoryLot = pgTable(
  "inventory_lot",
  {
    componentLotId: integer("component_lot_id")
      .notNull()
      .references(() => componentLot.id),
    locationId: integer("location_id")
      .notNull()
      .references(() => location.id),
    totalQuantity: numericDecimal("total_quantity").notNull(),
    allocatedQuantity: numericDecimal("allocated_quantity").notNull(),
    freeQuantity: numericDecimal("free_quantity").notNull(),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
    lastModified: timestamp("last_modified")
      .notNull()
      .default(sql`now()`)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.componentLotId, table.locationId] }),
  }),
);

export const inventoryLotRelations = relations(inventoryLot, ({ one }) => ({
  componentLot: one(componentLot, {
    fields: [inventoryLot.componentLotId],
    references: [componentLot.id],
  }),
  location: one(location, {
    fields: [inventoryLot.locationId],
    references: [location.id],
  }),
}));

export const inventoryLotLedger = pgTable("inventory_lot_ledger", {
  id: serial("id").notNull().primaryKey(),
  componentLotId: integer("component_lot_id")
    .notNull()
    .references(() => componentLot.id),
  locationId: integer("location_id")
    .notNull()
    .references(() => location.id),
  quantity: numericDecimal("quantity").notNull(),
  userId: uuid("user_id").references(() => profile.id),
  type: transactionType("type").notNull(),
  salesDespatchItemId: integer("sales_despatch_item_id").references(
    () => salesDespatchItem.id,
  ),
  productionJobAllocationId: integer("production_job_allocation_id").references(
    () => productionJobAllocation.id,
  ),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const inventory = pgTable(
  "inventory",
  {
    id: serial("id").notNull().primaryKey(),
    componentId: varchar("component_id")
      .notNull()
      .references(() => component.id),
    batchId: integer("batch_id").references(() => batch.id),
    locationId: integer("location_id")
      .notNull()
      .references(() => location.id),
    entryDate: date("entry_date", { mode: "date" }).notNull(),
    totalQuantity: numericDecimal("total_quantity").notNull(),
    allocatedQuantity: numericDecimal("allocated_quantity").notNull(),
    freeQuantity: numericDecimal("free_quantity").notNull(),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
    lastModified: timestamp("last_modified")
      .notNull()
      .default(sql`now()`)
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    unique: unique("unique_inventory")
      .on(t.componentId, t.batchId, t.locationId)
      .nullsNotDistinct(),
  }),
);

export const inventoryRelations = relations(inventory, ({ one }) => ({
  component: one(component, {
    fields: [inventory.componentId],
    references: [component.id],
  }),
  batch: one(batch, {
    fields: [inventory.batchId],
    references: [batch.id],
  }),
  location: one(location, {
    fields: [inventory.locationId],
    references: [location.id],
  }),
}));

export const inventoryLedger = pgTable("inventory_ledger", {
  id: serial("id").notNull().primaryKey(),
  componentId: varchar("component_id")
    .notNull()
    .references(() => component.id),
  batchId: integer("batch_id").references(() => batch.id),
  locationId: integer("location_id")
    .notNull()
    .references(() => location.id),
  quantity: numericDecimal("quantity").notNull(),
  userId: uuid("user_id").references(() => profile.id),
  type: transactionType("type").notNull(),
  salesDespatchItemId: integer("sales_despatch_item_id").references(
    () => salesDespatchItem.id,
  ),
  productionJobAllocationId: integer("production_job_allocation_id").references(
    () => productionJobAllocation.id,
  ),
  purchaseReceiptItemId: integer("purchase_receipt_item_id").references(
    () => purchaseReceiptItem.id,
  ),
  productionJobId: integer("production_job_id").references(
    () => productionJob.id,
  ),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const inventoryLedgerRelations = relations(
  inventoryLedger,
  ({ one }) => ({
    component: one(component, {
      fields: [inventoryLedger.componentId],
      references: [component.id],
    }),
    batch: one(batch, {
      fields: [inventoryLedger.batchId],
      references: [batch.id],
    }),
    location: one(location, {
      fields: [inventoryLedger.locationId],
      references: [location.id],
    }),
    user: one(profile, {
      fields: [inventoryLedger.userId],
      references: [profile.id],
    }),
    purchaseReceiptItem: one(purchaseReceiptItem, {
      fields: [inventoryLedger.purchaseReceiptItemId],
      references: [purchaseReceiptItem.id],
    }),
    salesDespatchItem: one(salesDespatchItem, {
      fields: [inventoryLedger.salesDespatchItemId],
      references: [salesDespatchItem.id],
    }),
    productionJobAllocation: one(productionJobAllocation, {
      fields: [inventoryLedger.productionJobAllocationId],
      references: [productionJobAllocation.id],
    }),
    productionJob: one(productionJob, {
      fields: [inventoryLedger.productionJobId],
      references: [productionJob.id],
    }),
  }),
);
