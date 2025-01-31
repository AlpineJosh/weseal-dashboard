import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Pool } from "@neondatabase/serverless";
import { drizzle as drizzleServerless } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleServer } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import type { Schema } from "./schema";
import { schema } from "./schema";

export type ServerlessClient = NeonDatabase<Schema>;
export function createServerlessClient(
  connectionString: string,
): ServerlessClient {
  const pool = new Pool({ connectionString });
  return drizzleServerless(pool, { schema: schema });
}

export type ServerClient = PostgresJsDatabase<Schema>;

export function createServerClient(connectionString: string): ServerClient {
  const client = postgres(connectionString);
  return drizzleServer(client, { schema: schema });
}
