import { sql } from "drizzle-orm";

import { db } from "./db";
import { seedComponents } from "./models/components";
import { seedInventoryData } from "./models/inventory";
import { seedOrders } from "./models/orders";
import { seedSageData } from "./models/sage";
import { seedUsers } from "./models/users";

// Reset the database
export const resetDatabase = async () => {
  // Drop all tables in the correct order
  await db.execute(sql`
    DROP TABLE IF EXISTS "public"."inventory" CASCADE;
    DROP TABLE IF EXISTS "public"."component" CASCADE;
    DROP TABLE IF EXISTS "public"."location" CASCADE;
    DROP TABLE IF EXISTS "public"."task" CASCADE;
    DROP TABLE IF EXISTS "public"."production_job" CASCADE;
    DROP TABLE IF EXISTS "public"."sales_despatch" CASCADE;
    DROP TABLE IF EXISTS "public"."purchase_order" CASCADE;
    DROP TABLE IF EXISTS "public"."sales_order" CASCADE;
    DROP TABLE IF EXISTS "public"."supplier" CASCADE;
    DROP TABLE IF EXISTS "public"."customer" CASCADE;
    DROP TABLE IF EXISTS "sage"."STOCK" CASCADE;
    DROP TABLE IF EXISTS "sage"."STOCK_CAT" CASCADE;
    DROP TABLE IF EXISTS "sage"."STOCK_TRAN" CASCADE;
  `);

  // Recreate tables using migrations
  await db.execute(sql`
    \i packages/db/supabase/migrations/0000_far_sunset_bain.sql
  `);
};

// Main seeding function
export const seedDatabase = async () => {
  try {
    // Reset the database first
    await resetDatabase();

    // Seed users first as they're needed for other operations
    const users = await seedUsers();

    // Seed Sage data
    const sageData = await seedSageData();

    // Seed components
    const components = await seedComponents();

    // Seed inventory data
    const inventoryData = await seedInventoryData();

    // Seed orders
    const orders = await seedOrders();

    return {
      users,
      sageData,
      components,
      inventoryData,
      orders,
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Database seeded successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error seeding database:", error);
      process.exit(1);
    });
}
