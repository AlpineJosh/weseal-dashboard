import { z } from "zod";

import { eq, ilike, sql } from "@repo/db";
import { db } from "@repo/db/client";
import { purchaseAccount } from "@repo/db/schema/sage";

import { createTRPCRouter, publicProcedure } from "../trpc";

const purchaseAccountInput = z
  .object({
    query: z.string().optional(),
  })
  .optional();

export const purchaseAccountRouter = createTRPCRouter({
  all: publicProcedure.input(purchaseAccountInput).query(async ({ input }) => {
    let query = db.select().from(purchaseAccount).$dynamic();

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
        .from(purchaseAccount)
        .where(eq(purchaseAccount.id, input.id));

      return order.length > 0 ? order[0] : null;
    }),
});
