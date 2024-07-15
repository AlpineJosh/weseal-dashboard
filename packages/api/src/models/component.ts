// import { z } from 'zod';
import { db, schema } from "@repo/db/client";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const componentRouter = createTRPCRouter({
  all: publicProcedure.query(() => {
    console.log("here")
    return db.select().from(schema.sage.stockComponent).limit(10);
  }),
});
