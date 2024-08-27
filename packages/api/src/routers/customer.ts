import { z } from "zod";

import { eq, ilike, sql } from "@repo/db";
import { db } from "@repo/db/client";
import { salesAccount } from "@repo/db/schema/sage";

import { createTRPCRouter, publicProcedure } from "../trpc";

const salesAccountInput = z
  .object({
    query: z.string().optional(),
  })
  .optional();

export const salesAccountRouter = createTRPCRouter({
  all: publicProcedure.input(salesAccountInput).query(async ({ input }) => {
    let query = db.select().from(salesAccount).$dynamic();

    const page = await query.limit(20).offset(0);

    return {
      data: page,
    };
  }),
  one: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const order = await db
        .select()
        .from(salesAccount)
        .where(eq(salesAccount.id, input.id));

      return order.length > 0 ? order[0] : null;
    }),
});
