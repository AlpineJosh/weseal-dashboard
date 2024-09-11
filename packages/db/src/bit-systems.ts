import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "./env";
import * as schema from "./tables/bit-systems.schema";

const client = postgres(env.DATABASE_URL);

export const bitSystemsSchema = schema;
export const bitSystemsDb = drizzle(client, { schema });
