import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";

const uniqueOrderItemInput = z.object({
  id: z.number(),
});

const orderItemOverview = datatable(schema.base.salesOrderItemOverview);

export const salesOrderItemRouter = {
  get: publicProcedure.input(uniqueOrderItemInput).query(async ({ input }) => {
    return await db.query.salesOrderItemOverview.findFirst({
      where: eq(schema.base.salesOrderItemOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(orderItemOverview.inputSchema)
    .query(async ({ input }) => {
      return await orderItemOverview.query(input);
    }),
} satisfies TRPCRouterRecord;
