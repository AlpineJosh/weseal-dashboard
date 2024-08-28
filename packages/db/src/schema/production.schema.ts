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
import { batch, location } from "./inventory.schema";

export const productionJob = pgTable("production_job", {
  id: serial("id").notNull().primaryKey(),
  componentId: varchar("component_id")
    .notNull()
    .references(() => component.id),
  batchNumber: varchar("batch_number"),
  targetQuantity: integer("target_quantity").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const productionJobRelations = relations(
  productionJob,
  ({ one, many }) => ({
    component: one(component, {
      fields: [productionJob.componentId],
      references: [component.id],
    }),
    batchesIn: many(productionBatchIn),
  }),
);

export const productionBatchIn = pgTable("production_batch_in", {
  id: serial("id").notNull().primaryKey(),
  jobId: integer("job_id")
    .notNull()
    .references(() => productionJob.id),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batch.id),
  quantityAllocated: real("quantity_allocated").notNull().default(0),
  locationId: integer("location_id")
    .notNull()
    .references(() => location.id),
  quantityUsed: real("quantity_used").notNull().default(0),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const productionJobBatchRelations = relations(
  productionBatchIn,
  ({ one }) => ({
    job: one(productionJob, {
      fields: [productionBatchIn.jobId],
      references: [productionJob.id],
    }),
    batch: one(batch, {
      fields: [productionBatchIn.batchId],
      references: [batch.id],
    }),
    location: one(location, {
      fields: [productionBatchIn.locationId],
      references: [location.id],
    }),
  }),
);
