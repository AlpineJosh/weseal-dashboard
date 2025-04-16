import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { PgQueryResultHKT, PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Pool } from "@neondatabase/serverless";
import { drizzle as drizzleServerless } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleServer } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import type { Schema } from "./schema";
import { schema } from "./schema";

export type ServerlessClient = NeonDatabase<Schema>;
export type ServerClient = PostgresJsDatabase<Schema>;
export type DatabaseClient = ServerlessClient | ServerClient;

export type DatabaseTransaction = PgTransaction<
  PgQueryResultHKT,
  Schema,
  ExtractTablesWithRelations<Schema>
>;

export const createDatabaseClient = (
  connectionString: string,
  dev?: boolean,
): DatabaseClient => {
  if (!dev) {
    const pool = new Pool({ connectionString });
    return drizzleServerless(pool, { schema, logger: dev });
  } else {
    const client = postgres(connectionString);
    return drizzleServer(client, { schema, logger: dev });
  }
};
