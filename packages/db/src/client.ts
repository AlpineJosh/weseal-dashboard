import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from '@neondatabase/serverless'

import { env } from "./env";
import { flatSchema, schema } from "./schema/index";

const client = new Pool({connectionString: env.DATABASE_URL});
const db = drizzle(client, { schema: flatSchema });

export { schema, db };
