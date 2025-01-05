import { createServerlessClient } from "@repo/db";

import { env } from "./env";

export const db = createServerlessClient(env.DATABASE_URL);
