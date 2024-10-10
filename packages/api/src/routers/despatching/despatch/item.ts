import { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";

const uniqueDespatchItemInput = z.object({
  id: z.number(),
});

const despatchItemOverview = datatable(schema.salesDespatchItemOverview);

export const salesDespatchItemRouter = {
  get: publicProcedure
    .input(uniqueDespatchItemInput)
    .query(async ({ input }) => {
      return db.query.salesDespatchItemOverview.findFirst({
        where: eq(schema.salesDespatchItemOverview.id, input.id),
      });
    }),
  list: publicProcedure
    .input(despatchItemOverview.inputSchema)
    .query(async ({ input }) => {
      return await despatchItemOverview.query(input);
    }),
} satisfies TRPCRouterRecord;
