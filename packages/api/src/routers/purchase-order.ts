import { z } from "zod";

import { ilike, sql } from "@repo/db";
import { db } from "@repo/db/client";
import { purchaseOrder } from "@repo/db/schema/sage";

import { createTRPCRouter, publicProcedure } from "../trpc";

const purchaseOrderInput = z
  .object({
    query: z.string().optional(),
  })
  .optional();

export const purchaseOrderRouter = createTRPCRouter({
  all: publicProcedure.input(purchaseOrderInput).query(async ({ input }) => {
    let query = db.select().from(purchaseOrder).$dynamic();

    const page = await query.limit(20).offset(0);
    console.log(page);
    return {
      data: page,
    };
  }),
});
