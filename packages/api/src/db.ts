import type { DatabaseTransaction } from "@repo/db";
import { createDatabaseClient } from "@repo/db";

import { env } from "./env";

const dev = env.VERCEL_ENV === undefined;
export const db = createDatabaseClient(env.POSTGRES_URL, dev);

export type Transaction = DatabaseTransaction;
