import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";

const uniqueOrderItemInput = z.object({
  id: z.number(),
});

const orderItemOverview = datatable(schema.salesOrderItemOverview);

export const salesOrderItemRouter = {
  get: publicProcedure.input(uniqueOrderItemInput).query(async ({ input }) => {
    return db.query.salesOrderItemOverview.findFirst({
      where: eq(schema.salesOrderItemOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(orderItemOverview.inputSchema)
    .query(async ({ input }) => {
      return await orderItemOverview.query(input);
    }),
} satisfies TRPCRouterRecord;
