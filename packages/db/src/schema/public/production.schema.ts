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
  componentId: varchar("component_id")
    .notNull()
    .references(() => component.id),
  batchId: integer("batch_id").references(() => batch.id),
  outputLocationId: integer("output_location_id")
    .notNull()
    .references(() => location.id),
  targetQuantity: numericDecimal("target_quantity")
    .notNull()
    .default(new Decimal(0)),
  quantityProduced: numericDecimal("quantity_produced")
    .notNull()
    .default(new Decimal(0)),
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
    component: one(component, {
      fields: [productionJob.componentId],
      references: [component.id],
    }),
    outputLocation: one(location, {
      fields: [productionJob.outputLocationId],
      references: [location.id],
    }),
    allocations: many(productionJobAllocation),
  }),
);

export const productionJobAllocation = pgTable("production_job_allocation", {
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
  totalQuantity: numericDecimal("total_quantity")
    .notNull()
    .default(new Decimal(0)),
  remainingQuantity: numericDecimal("remaining_quantity")
    .notNull()
    .default(new Decimal(0)),
  usedQuantity: numericDecimal("used_quantity")
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

export const productionJobAllocationRelations = relations(
  productionJobAllocation,
  ({ one }) => ({
    job: one(productionJob, {
      fields: [productionJobAllocation.productionJobId],
      references: [productionJob.id],
    }),
    component: one(component, {
      fields: [productionJobAllocation.componentId],
      references: [component.id],
    }),
    batch: one(batch, {
      fields: [productionJobAllocation.batchId],
      references: [batch.id],
    }),
    location: one(location, {
      fields: [productionJobAllocation.locationId],
      references: [location.id],
    }),
  }),
);

export const productionJobAllocationLot = pgTable(
  "production_job_allocation_lot",
  {
    id: serial("id").notNull().primaryKey(),
    productionJobAllocationId: integer("production_job_allocation_id")
      .notNull()
      .references(() => productionJobAllocation.id),
    quantity: numericDecimal("quantity").notNull().default(new Decimal(0)),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
    lastModified: timestamp("last_modified")
      .notNull()
      .default(sql`now()`)
      .$onUpdate(() => new Date()),
  },
);

export const productionJobAllocationLotRelations = relations(
  productionJobAllocationLot,
  ({ one }) => ({
    allocation: one(productionJobAllocation, {
      fields: [productionJobAllocationLot.productionJobAllocationId],
      references: [productionJobAllocation.id],
    }),
  }),
);
