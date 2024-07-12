// import { z } from 'zod';
import { db, schema } from "@repo/db/client";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const componentRouter = createTRPCRouter({
  all: publicProcedure.query(() => {
    return db.select().from(schema.sage.stockComponent);
  }),
});
