import { z } from "zod";

import { eq, ilike, sql } from "@repo/db";
import { db } from "@repo/db/client";
import { salesOrder } from "@repo/db/schema/sage";

import { createTRPCRouter, publicProcedure } from "../trpc";

const salesOrderInput = z
  .object({
    query: z.string().optional(),
  })
  .optional();

export const salesOrderRouter = createTRPCRouter({
  all: publicProcedure.input(salesOrderInput).query(async ({ input }) => {
    let query = db.select().from(salesOrder).$dynamic();

    const page = await query.limit(20).offset(0);

    return {
      data: page,
    };
  }),
  one: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const order = await db
        .select()
        .from(salesOrder)
        .where(eq(salesOrder.id, input.id));

      return order.length > 0 ? order[0] : null;
    }),
});
