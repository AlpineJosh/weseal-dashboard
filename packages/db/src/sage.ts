import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "./env";
import * as schema from "./tables/sage.schema";

const client = postgres(env.DATABASE_URL);

export const sageSchema = schema;
export const sageDb = drizzle(client, { schema });
