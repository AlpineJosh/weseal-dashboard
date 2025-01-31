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
import { batch } from "./batch.schema";
import { component } from "./component.schema";
import { location } from "./location.schema";

export const productionJob = pgTable("production_job", {
  id: serial("id").notNull().primaryKey(),
  outputComponentId: varchar("output_component_id")
    .notNull()
    .references(() => component.id),
  batchId: integer("batch_id").references(() => batch.id),
  outputLocationId: integer("output_location_id")
    .notNull()
    .references(() => location.id),
  targetQuantity: integer("target_quantity").notNull().default(0),
  quantityProduced: integer("quantity_produced").notNull().default(0),
  isComplete: boolean("is_complete").notNull().default(false),
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
    inputs: many(productionJobInput),
  }),
);

export const productionJobInput = pgTable("production_job_input", {
  id: serial("id").notNull().primaryKey(),
  productionJobId: integer("production_job_id")
    .notNull()
    .references(() => productionJob.id),
  componentId: varchar("component_id")
    .notNull()
    .references(() => component.id),
  batchId: integer("batch_id").references(() => batch.id),
  locationId: integer("location_id")
    .notNull()
    .references(() => location.id),
  quantityAllocated: numericDecimal("quantity_allocated")
    .notNull()
    .default(new Decimal(0)),
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

export const productionJobInputRelations = relations(
  productionJobInput,
  ({ one }) => ({
    job: one(productionJob, {
      fields: [productionJobInput.productionJobId],
      references: [productionJob.id],
    }),
    component: one(component, {
      fields: [productionJobInput.componentId],
      references: [component.id],
    }),
    batch: one(batch, {
      fields: [productionJobInput.batchId],
      references: [batch.id],
    }),
    location: one(location, {
      fields: [productionJobInput.locationId],
      references: [location.id],
    }),
  }),
);
