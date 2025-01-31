import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { numericDecimal } from "../../lib/numeric";
import { batch } from "./batch.schema";
import { component } from "./component.schema";
import { salesDespatchItem } from "./despatching.schema";
import { location } from "./location.schema";
import { productionJob, productionJobInput } from "./production.schema";
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

export const componentLot = pgTable("component_lot", {
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
});

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

export const inventory = pgTable(
  "inventory",
  {
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
  (table) => ({
    pk: primaryKey({
      columns: [table.componentId, table.batchId, table.locationId],
    }),
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
  isAllocated: boolean("is_allocated").notNull().default(false),
  purchaseReceiptItemId: integer("purchase_receipt_item_id").references(
    () => purchaseReceiptItem.id,
  ),
  salesDespatchItemId: integer("sales_despatch_item_id").references(
    () => salesDespatchItem.id,
  ),
  productionJobInputId: integer("production_job_input_id").references(
    () => productionJobInput.id,
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
    productionJobInput: one(productionJobInput, {
      fields: [inventoryLedger.productionJobInputId],
      references: [productionJobInput.id],
    }),
    productionJob: one(productionJob, {
      fields: [inventoryLedger.productionJobId],
      references: [productionJob.id],
    }),
  }),
);

export const batchMovement = pgTable("batch_movement", {
  id: serial("id").notNull().primaryKey(),
  date: timestamp("date").notNull(),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batch.id),
  locationId: integer("location_id")
    .notNull()
    .references(() => location.id),
  quantity: numericDecimal("quantity").notNull(),
  userId: uuid("user_id").references(() => profile.id),
  type: transactionType("type").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const batchMovementRelations = relations(batchMovement, ({ one }) => ({
  batch: one(batch, {
    fields: [batchMovement.batchId],
    references: [batch.id],
  }),
  location: one(location, {
    fields: [batchMovement.locationId],
    references: [location.id],
  }),
}));

export const batchMovementCorrection = pgTable("batch_movement_correction", {
  id: serial("id").notNull().primaryKey(),
  correctionMovementId: integer("correction_movement_id").notNull(),
  correctedMovementId: integer("corrected_movement_id").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const correctionMovementId = foreignKey({
  name: "correction_movement_id_batch_movement_id_fk",
  columns: [batchMovementCorrection.correctionMovementId],
  foreignColumns: [batchMovement.id],
});

export const correctedMovementId = foreignKey({
  name: "corrected_movement_id_batch_movement_id_fk",
  columns: [batchMovementCorrection.correctedMovementId],
  foreignColumns: [batchMovement.id],
});

export const batchMovementCorrectionRelations = relations(
  batchMovementCorrection,
  ({ one }) => ({
    correctionMovement: one(batchMovement, {
      fields: [batchMovementCorrection.correctionMovementId],
      references: [batchMovement.id],
    }),
    correctedMovement: one(batchMovement, {
      fields: [batchMovementCorrection.correctedMovementId],
      references: [batchMovement.id],
    }),
  }),
);
