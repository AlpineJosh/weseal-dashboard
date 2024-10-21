import { pgSchema, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

const authSchema = pgSchema("auth");

const user = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const profile = pgTable("profile", {
  id: uuid("id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
});
