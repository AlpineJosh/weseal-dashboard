import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";

const uniqueDespatchItemInput = z.object({
  id: z.number(),
});

const despatchItemOverview = datatable(schema.base.salesDespatchItemOverview);

export const salesDespatchItemRouter = {
  get: publicProcedure
    .input(uniqueDespatchItemInput)
    .query(async ({ input }) => {
      return db.query.salesDespatchItemOverview.findFirst({
        where: eq(schema.base.salesDespatchItemOverview.id, input.id),
      });
    }),
  list: publicProcedure
    .input(despatchItemOverview.inputSchema)
    .query(async ({ input }) => {
      return await despatchItemOverview.query(input);
    }),
} satisfies TRPCRouterRecord;
