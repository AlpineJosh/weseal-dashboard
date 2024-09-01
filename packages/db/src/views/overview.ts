import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgTable,
  real,
  serial,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import {
  componentCategory,
  department,
  subcomponent,
} from "../tables/component.schema";
import { batch, batchMovement, location } from "../tables/inventory.schema";

export const batchLocationQuantity = pgTable("batch_location_quantity", {
  componentId: varchar("component_id").notNull(),
  batchId: varchar("batch_id").notNull(),
  locationId: integer("location_id").notNull(),
  total: real("total").notNull(),
  allocated: real("allocated").notNull(),
  free: real("free").notNull(),
});

export const componentOverview = pgTable("component_overview", {
  id: varchar("id"),
  description: varchar("description"),
  hasSubcomponents: boolean("has_subcomponents").notNull(),
  totalQuantity: real("total_quantity").notNull(),
  allocatedQuantity: real("allocated_quantity").notNull(),
  freeQuantity: real("free_quantity").notNull(),
  sageQuantity: real("sage_quantity").notNull(),
  sageDiscrepancy: real("sage_discrepancy").notNull(),
  unit: varchar("unit"),
  categoryId: smallint("category_id"),
  departmentId: integer("department_id"),
  isTraceable: boolean("traceable"),
  defaultLocationId: integer("default_location_id"),
  requiresQualityCheck: boolean("requires_quality_check"),
  qualityCheckDetails: varchar("quality_check_details"),
  createdAt: timestamp("created_at").notNull(),
  lastModified: timestamp("last_modified").notNull(),
  isDeleted: boolean("is_deleted").notNull(),
});

export const componentOverviewRelations = relations(
  componentOverview,
  ({ one, many }) => ({
    subcomponents: many(subcomponent),
    department: one(department, {
      fields: [componentOverview.departmentId],
      references: [department.id],
    }),
    category: one(componentCategory, {
      fields: [componentOverview.categoryId],
      references: [componentCategory.id],
    }),
    batches: many(batch),
    defaultLocation: one(location, {
      fields: [componentOverview.defaultLocationId],
      references: [location.id],
    }),
  }),
);

export const batchOverview = pgTable("batch_overview", {
  id: serial("id").notNull(),
  componentId: varchar("component_id").notNull(),
  batchReference: varchar("batch_reference"),
  entryDate: date("entry_date", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").notNull(),
  lastModified: timestamp("last_modified").notNull(),
});

export const batchOverviewRelations = relations(
  batchOverview,
  ({ one, many }) => ({
    component: one(componentOverview, {
      fields: [batchOverview.componentId],
      references: [componentOverview.id],
    }),
    movements: many(batchMovement),
    locations: many(batchLocationQuantity),
  }),
);
