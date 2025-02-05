import { relations, sql } from "drizzle-orm";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

import { component } from "./component.schema";
import { batchMovement } from "./inventory.schema";
import { productionJob } from "./production.schema";

export const batch = pgTable("batch", {
  id: serial("id").notNull().primaryKey(),
  componentId: varchar("component_id")
    .notNull()
    .references(() => component.id),
  batchReference: varchar("batch_reference"),
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
  productionJobs: many(productionJob),
}));
