import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  integer,
  pgSchema,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import * as sage from "./sage.schema";

export const stockSchema = pgSchema("stock_management");

export const stockTransactionTypeEnum = stockSchema.enum(
  "stock_transaction_type",
  ["shipment", "return", "transfer", "production", "adjustment"],
);

export const productionJobStatus = stockSchema.table("production_job_status", {
  id: serial("id").notNull().primaryKey(),
  name: varchar("name").notNull(),
  isActive: boolean("is_active").notNull().default(false),
});

export const productionJob = stockSchema.table("production_job", {
  id: serial("id").notNull().primaryKey(),
  componentId: varchar("component_id")
    .notNull()
    .references(() => sage.stockComponent.id),
  batchNumber: varchar("batch_number"),
  targetQuantity: integer("target_quantity").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const productionJobRelations = relations(
  productionJob,
  ({ one, many }) => ({
    component: one(sage.stockComponent, {
      fields: [productionJob.componentId],
      references: [sage.stockComponent.id],
    }),
    items: many(productionJobItem),
  }),
);

export const productionJobItem = stockSchema.table("production_job_item", {
  id: serial("id").notNull().primaryKey(),
  jobId: integer("job_id")
    .notNull()
    .references(() => productionJob.id),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batch.id),
  quantityAllocated: decimal("quantity_allocated").notNull().default("0.0"),
  locationId: integer("location_id")
    .notNull()
    .references(() => location.id),
  quantityUsed: decimal("quantity_used").notNull().default("0.0"),
});

export const productionJobItemRelations = relations(
  productionJobItem,
  ({ one }) => ({
    job: one(productionJob, {
      fields: [productionJobItem.jobId],
      references: [productionJob.id],
    }),
    batch: one(batch, {
      fields: [productionJobItem.batchId],
      references: [batch.id],
    }),
    location: one(location, {
      fields: [productionJobItem.locationId],
      references: [location.id],
    }),
  }),
);

export const task = stockSchema.table("task", {
  id: serial("id").notNull().primaryKey(),
  type: stockTransactionTypeEnum("type").notNull(),
  isCancelled: boolean("is_cancelled").notNull().default(false),
  assignedToId: varchar("assigned_to_user_id").notNull(),
  createdById: varchar("created_by_user_id").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
  productionJobId: integer("production_job_id").references(
    () => productionJob.id,
  ),
  purchaseOrderId: integer("purchase_order_id").references(
    () => sage.purchaseOrder.id,
  ),
  salesOrderId: integer("sales_order_id").references(() => sage.salesOrder.id),
});

export const taskRelations = relations(task, ({ one, many }) => ({
  items: many(taskItem),
  productionJob: one(productionJob, {
    fields: [task.productionJobId],
    references: [productionJob.id],
  }),
  purchaseOrder: one(sage.purchaseOrder, {
    fields: [task.purchaseOrderId],
    references: [sage.purchaseOrder.id],
  }),
}));

export const taskItem = stockSchema.table("task_item", {
  id: serial("id").notNull().primaryKey(),
  taskId: integer("task_id")
    .notNull()
    .references(() => task.id),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batch.id),
  pickLocationId: integer("pick_location_id").references(() => location.id),
  putLocationId: integer("put_location_id").references(() => location.id),
  quantity: decimal("quantity").notNull(),
  isComplete: boolean("is_complete").notNull().default(false),
});

export const taskItemRelations = relations(taskItem, ({ one }) => ({
  task: one(task, {
    fields: [taskItem.taskId],
    references: [task.id],
  }),
  batch: one(batch, {
    fields: [taskItem.batchId],
    references: [batch.id],
  }),
  pickLocation: one(location, {
    fields: [taskItem.pickLocationId],
    references: [location.id],
  }),
  putLocation: one(location, {
    fields: [taskItem.putLocationId],
    references: [location.id],
  }),
}));

export const locationGroup = stockSchema.table("location_group", {
  id: serial("id").notNull().primaryKey(),
  name: varchar("name").notNull(),
  details: varchar("details"),
  parentGroupId: integer("parent_group_id").references(
    (): AnyPgColumn => locationGroup.id,
  ),
});

export const locationGroupRelations = relations(
  locationGroup,
  ({ one, many }) => ({
    parentGroup: one(locationGroup, {
      fields: [locationGroup.parentGroupId],
      references: [locationGroup.id],
    }),
    locations: many(location),
  }),
);

export const locationType = stockSchema.table("location_type", {
  id: serial("id").notNull().primaryKey(),
  name: varchar("name").notNull(),
  isPickable: boolean("is_pickable").notNull().default(true),
  isTransient: boolean("is_transient").notNull().default(false),
});

export const location = stockSchema.table("location", {
  id: serial("id").notNull().primaryKey(),
  name: varchar("name").notNull(),
  details: varchar("details"),
  groupId: integer("group_id")
    .notNull()
    .references(() => locationGroup.id),
  typeId: integer("type_id")
    .notNull()
    .references(() => locationType.id),
});

export const locationRelations = relations(location, ({ one, many }) => ({
  group: one(locationGroup, {
    fields: [location.groupId],
    references: [locationGroup.id],
  }),
  type: one(locationType, {
    fields: [location.typeId],
    references: [locationType.id],
  }),
  stockTransactions: many(stockTransaction),
}));

export const batchTypeEnum = stockSchema.enum("batch_type", [
  "production",
  "purchase",
  "untracked",
]);

export const batch = stockSchema.table("batch", {
  id: serial("id").notNull().primaryKey(),
  componentId: varchar("component_id")
    .notNull()
    .references(() => sage.stockComponent.id),
  batchNumber: varchar("batch_number"),
  date: date("date").notNull(),
  type: batchTypeEnum("type").notNull(),
  productionJobId: integer("production_job_id").references(
    () => productionJob.id,
  ),
  purchaseOrderId: integer("purchase_order_id").references(
    () => sage.purchaseOrder.id,
  ),
});

export const batchRelations = relations(batch, ({ one }) => ({
  component: one(sage.stockComponent, {
    fields: [batch.componentId],
    references: [sage.stockComponent.id],
  }),
  productionJob: one(productionJob, {
    fields: [batch.productionJobId],
    references: [productionJob.id],
  }),
  purchaseOrder: one(sage.purchaseOrder, {
    fields: [batch.purchaseOrderId],
    references: [sage.purchaseOrder.id],
  }),
}));

export const stockTransaction = stockSchema.table("stock_transaction", {
  id: serial("id").notNull().primaryKey(),
  date: timestamp("date").notNull(),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batch.id),
  locationId: integer("location_id")
    .notNull()
    .references(() => location.id),
  quantity: decimal("quantity").notNull(),
  userId: varchar("user_id").notNull(),
  type: stockTransactionTypeEnum("type").notNull(),
  productionJobId: integer("production_job_id").references(
    () => productionJob.id,
  ),
  taskId: integer("task_id").references(() => task.id),
  salesOrder: integer("sales_order").references(() => sage.salesOrder.id),
  purchaseOrder: integer("purchase_order").references(
    () => sage.purchaseOrder.id,
  ),
});

export const stockTransactionRelations = relations(
  stockTransaction,
  ({ one }) => ({
    batch: one(batch, {
      fields: [stockTransaction.batchId],
      references: [batch.id],
    }),
    location: one(location, {
      fields: [stockTransaction.locationId],
      references: [location.id],
    }),
    productionJob: one(productionJob, {
      fields: [stockTransaction.productionJobId],
      references: [productionJob.id],
    }),
    task: one(task, {
      fields: [stockTransaction.taskId],
      references: [task.id],
    }),
    salesOrder: one(sage.salesOrder, {
      fields: [stockTransaction.salesOrder],
      references: [sage.salesOrder.id],
    }),
    purchaseOrder: one(sage.purchaseOrder, {
      fields: [stockTransaction.purchaseOrder],
      references: [sage.purchaseOrder.id],
    }),
  }),
);

export const stockMeta = stockSchema.table("stock_meta", {
  id: serial("id").notNull().primaryKey(),
  componentId: varchar("component_id")
    .notNull()
    .references(() => sage.stockComponent.id),
  isTraceable: boolean("is_traceable"),
  defaultLocationId: integer("default_location_id").references(
    () => location.id,
  ),
  requiresQualityCheck: boolean("requires_quality_check").default(false),
  qualityCheckDetails: varchar("quality_check_details"),
});

export const stockMetaRelations = relations(stockMeta, ({ one }) => ({
  component: one(sage.stockComponent, {
    fields: [stockMeta.componentId],
    references: [sage.stockComponent.id],
  }),
  defaultLocation: one(location, {
    fields: [stockMeta.defaultLocationId],
    references: [location.id],
  }),
}));
