import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import { env } from "./env";
import schema from "./schema";

const client = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(client, { schema, logger: true });
