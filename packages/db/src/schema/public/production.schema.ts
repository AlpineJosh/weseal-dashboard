import Decimal from "decimal.js";
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
import { batch, location } from "./inventory.schema";

export const productionJob = pgTable("production_job", {
  id: serial("id").notNull().primaryKey(),
  outputComponentId: varchar("output_component_id")
    .notNull()
    .references(() => component.id),
  batchNumber: varchar("batch_number"),
  outputLocationId: integer("output_location_id")
    .notNull()
    .references(() => location.id),
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
    outputComponent: one(component, {
      fields: [productionJob.outputComponentId],
      references: [component.id],
    }),
    outputLocation: one(location, {
      fields: [productionJob.outputLocationId],
      references: [location.id],
    }),
    inputs: many(productionBatchInput),
    outputs: many(productionBatchOutput),
  }),
);

export const productionBatchInput = pgTable("production_batch_input", {
  id: serial("id").notNull().primaryKey(),
  jobId: integer("job_id")
    .notNull()
    .references(() => productionJob.id),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batch.id),
  quantityAllocated: numericDecimal("quantity_allocated")
    .notNull()
    .default(new Decimal(0)),
  locationId: integer("location_id")
    .notNull()
    .references(() => location.id),
  quantityUsed: numericDecimal("quantity_used")
    .notNull()
    .default(new Decimal(0)),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const productionBatchInputRelations = relations(
  productionBatchInput,
  ({ one }) => ({
    job: one(productionJob, {
      fields: [productionBatchInput.jobId],
      references: [productionJob.id],
    }),
    batch: one(batch, {
      fields: [productionBatchInput.batchId],
      references: [batch.id],
    }),
    location: one(location, {
      fields: [productionBatchInput.locationId],
      references: [location.id],
    }),
  }),
);

export const productionBatchOutput = pgTable("production_batch_output", {
  id: serial("id").notNull().primaryKey(),
  jobId: integer("job_id")
    .notNull()
    .references(() => productionJob.id),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batch.id),
  productionQuantity: numericDecimal("production_quantity")
    .notNull()
    .default(new Decimal(0)),
  productionDate: timestamp("production_date")
    .notNull()
    .default(sql`now()`),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const productionBatchOutputRelations = relations(
  productionBatchOutput,
  ({ one }) => ({
    job: one(productionJob, {
      fields: [productionBatchOutput.jobId],
      references: [productionJob.id],
    }),
    batch: one(batch, {
      fields: [productionBatchOutput.batchId],
      references: [batch.id],
    }),
  }),
);
