import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { inventory } from "./inventory.schema";
import { productionJobAllocation } from "./production.schema";
import { taskAllocation } from "./task.schema";

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
  inventory: many(inventory),
  taskAllocations: many(taskAllocation),
  productionJobAllocations: many(productionJobAllocation),
}));
