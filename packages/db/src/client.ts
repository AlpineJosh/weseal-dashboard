import { drizzle as drizzleServerless, NeonDatabase } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleServer, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Pool } from "@neondatabase/serverless";
import postgres from "postgres";
import { UnifiedSchema, unifiedSchema } from "./schema"
import { DrizzleConfig } from "drizzle-orm";

export type ServerlessClient<TSchema extends Partial<UnifiedSchema> = UnifiedSchema> = NeonDatabase<TSchema>
export function createServerlessClient<TSchema extends Partial<UnifiedSchema> = UnifiedSchema>
  (connectionString: string, config?: Partial<DrizzleConfig<TSchema>>): ServerlessClient<TSchema> {
    config = {
        schema: unifiedSchema as TSchema,
        ...config
    }
  const pool = new Pool({ connectionString });
  return drizzleServerless(pool, config);
}

export type ServerClient<TSchema extends Partial<UnifiedSchema> = UnifiedSchema> = PostgresJsDatabase<TSchema>

export function createServerClient<TSchema extends Partial<UnifiedSchema> = UnifiedSchema>
(connectionString: string, config?: Partial<DrizzleConfig<TSchema>>): ServerClient<TSchema> {
    config = {
        schema: unifiedSchema as TSchema,
        ...config
    }
  const client = postgres(connectionString);
  return drizzleServer(client, config);
}