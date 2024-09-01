import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { component } from "./component.schema";
import { salesDespatch } from "./despatching.schema";
import { productionJob } from "./production.schema";

import "./receiving.schema";

import { batchLocationQuantity } from "../views/overview";

export const batchMovementType = pgEnum("batch_movement_type", [
  "despatch",
  "receipt",
  "transfer",
  "production",
  "correction",
  "wastage",
  "lost",
  "found",
]);

export const batchMovement = pgTable("batch_movement", {
  id: serial("id").notNull().primaryKey(),
  date: timestamp("date").notNull(),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batch.id),
  locationId: integer("location_id")
    .notNull()
    .references(() => location.id),
  quantity: real("quantity").notNull(),
  userId: varchar("user_id").notNull(),
  type: batchMovementType("type").notNull(),
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

export const task = pgTable("task", {
  id: serial("id").notNull().primaryKey(),
  type: batchMovementType("type").notNull(),
  isCancelled: boolean("is_cancelled").notNull().default(false),
  assignedToId: varchar("assigned_to_user_id").notNull(),
  createdById: varchar("created_by_user_id").notNull(),
  productionJobId: integer("production_job_id").references(
    () => productionJob.id,
  ),
  salesDespatchId: integer("sales_despatch_id").references(
    () => salesDespatch.id,
  ),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const taskRelations = relations(task, ({ one, many }) => ({
  items: many(taskItem),
  productionJob: one(productionJob, {
    fields: [task.productionJobId],
    references: [productionJob.id],
  }),
  salesDespatch: one(salesDespatch, {
    fields: [task.salesDespatchId],
    references: [salesDespatch.id],
  }),
}));

export const taskItem = pgTable("task_item", {
  id: serial("id").notNull().primaryKey(),
  taskId: integer("task_id")
    .notNull()
    .references(() => task.id),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batch.id),
  pickLocationId: integer("pick_location_id").references(() => location.id),
  putLocationId: integer("put_location_id").references(() => location.id),
  quantity: real("quantity").notNull(),
  isComplete: boolean("is_complete").notNull().default(false),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
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

export const locationGroup = pgTable("location_group", {
  id: serial("id").notNull().primaryKey(),
  name: varchar("name").notNull(),
  details: varchar("details"),
  parentGroupId: integer("parent_group_id").references(
    (): AnyPgColumn => locationGroup.id,
  ),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
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

export const locationType = pgTable("location_type", {
  id: serial("id").notNull().primaryKey(),
  name: varchar("name").notNull(),
  isPickable: boolean("is_pickable").notNull().default(true),
  isTransient: boolean("is_transient").notNull().default(false),
});

export const location = pgTable("location", {
  id: serial("id").notNull().primaryKey(),
  name: varchar("name").notNull(),
  details: varchar("details"),
  groupId: integer("group_id")
    .notNull()
    .references(() => locationGroup.id),
  typeId: integer("type_id")
    .notNull()
    .references(() => locationType.id),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
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
  batchMovements: many(batchMovement),
  quantities: many(batchLocationQuantity),
}));

export const batch = pgTable("batch", {
  id: serial("id").notNull().primaryKey(),
  componentId: varchar("component_id")
    .notNull()
    .references(() => component.id),
  batchReference: varchar("batch_reference"),
  entryDate: date("entry_date", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const batchRelations = relations(batch, ({ one, many }) => ({
  component: one(component, {
    fields: [batch.componentId],
    references: [component.id],
  }),
  movements: many(batchMovement),
  locations: many(batchLocationQuantity),
}));
