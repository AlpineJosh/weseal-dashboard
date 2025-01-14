import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { numericDecimal } from "../../lib/numeric";
import { batch, location } from "./inventory.schema";

export const department = pgTable("department", {
  id: integer("id").primaryKey(),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

export const departmentRelations = relations(department, ({ many }) => ({
  components: many(component),
}));

export const componentCategory = pgTable("component_category", {
  id: integer("id").primaryKey(),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

export const componentCategoryRelations = relations(
  componentCategory,
  ({ many }) => ({
    components: many(component),
  }),
);

export const component = pgTable("component", {
  id: varchar("id").primaryKey(),
  description: varchar("description"),
  hasSubcomponents: boolean("has_subcomponents").notNull().default(false),
  sageQuantity: numericDecimal("sage_quantity").notNull(),
  unit: varchar("unit"),
  categoryId: smallint("category_id").references(() => componentCategory.id),
  departmentId: integer("department_id").references(() => department.id),
  isTraceable: boolean("traceable").default(false),
  defaultLocationId: integer("default_location_id").references(
    () => location.id,
  ),
  requiresQualityCheck: boolean("requires_quality_check").default(false),
  qualityCheckDetails: varchar("quality_check_details"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

export const componentRelations = relations(component, ({ one, many }) => ({
  subcomponents: many(subcomponent, {
    relationName: "subcomponentComponent",
  }),
  department: one(department, {
    fields: [component.departmentId],
    references: [department.id],
  }),
  category: one(componentCategory, {
    fields: [component.categoryId],
    references: [componentCategory.id],
  }),
  batches: many(batch),
  defaultLocation: one(location, {
    fields: [component.defaultLocationId],
    references: [location.id],
  }),
}));

export const subcomponent = pgTable("subcomponent", {
  id: serial("id").primaryKey(),
  componentId: varchar("component_id")
    .notNull()
    .references(() => component.id),
  subcomponentId: varchar("subcomponent_id")
    .notNull()
    .references(() => component.id),
  level: smallint("level"),
  quantity: numericDecimal("quantity").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  lastModified: timestamp("last_modified")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
});

export const subcomponentRelations = relations(subcomponent, ({ one }) => ({
  component: one(component, {
    fields: [subcomponent.componentId],
    references: [component.id],
    relationName: "subcomponentComponent",
  }),
  subcomponent: one(component, {
    fields: [subcomponent.subcomponentId],
    references: [component.id],
    relationName: "subcomponentSubcomponent",
  }),
}));
