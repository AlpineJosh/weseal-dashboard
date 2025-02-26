import type { NeonQueryResultHKT } from "drizzle-orm/neon-serverless";
import type { PgTransaction } from "drizzle-orm/pg-core";

import type { ExtractTablesWithRelations, Schema } from "@repo/db";
import { createServerClient, createServerlessClient } from "@repo/db";

import { env } from "./env";

export const db = createServerlessClient(env.DATABASE_URL);

export const serverDb = createServerClient(env.DATABASE_URL);

export type Transaction = PgTransaction<
  NeonQueryResultHKT,
  Schema,
  ExtractTablesWithRelations<Schema>
>;
