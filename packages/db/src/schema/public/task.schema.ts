import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { numericDecimal } from "../../lib/numeric";
import { batch } from "./batch.schema";
import { component } from "./component.schema";
import { salesDespatch } from "./despatching.schema";
import { transactionType } from "./inventory.schema";
import { location } from "./location.schema";
import { productionJob } from "./production.schema";
import { profile } from "./profile.schema";

export const task = pgTable("task", {
  id: serial("id").notNull().primaryKey(),
  type: transactionType("type").notNull(),
  isCancelled: boolean("is_cancelled").notNull().default(false),
  assignedToId: uuid("assigned_to_user_id").references(() => profile.id),
  createdById: uuid("created_by_user_id").references(() => profile.id),
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
  componentId: varchar("component_id")
    .notNull()
    .references(() => component.id),
  batchId: integer("batch_id").references(() => batch.id),
  pickLocationId: integer("pick_location_id").references(() => location.id),
  putLocationId: integer("put_location_id").references(() => location.id),
  quantity: numericDecimal("quantity").notNull(),
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
  component: one(component, {
    fields: [taskItem.componentId],
    references: [component.id],
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
