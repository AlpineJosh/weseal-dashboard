import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}

const nonPoolingUrl = process.env.DATABASE_URL.replace(":6543", ":5432");

export default {
  schema: "./src/kit-schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: { url: nonPoolingUrl },
} satisfies Config;
