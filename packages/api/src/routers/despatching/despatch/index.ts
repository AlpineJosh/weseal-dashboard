import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";
import { salesDespatchItemRouter } from "./item";

const uniqueDespatchInput = z.object({
  id: z.number(),
});

const despatchOverview = datatable(schema.base.salesDespatchOverview);

export const salesDespatchRouter = {
  get: publicProcedure.input(uniqueDespatchInput).query(async ({ input }) => {
    return await db.query.salesDespatchOverview.findFirst({
      where: eq(schema.base.salesDespatchOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(despatchOverview.inputSchema)
    .query(async ({ input }) => {
      return await despatchOverview.query(input);
    }),
  items: salesDespatchItemRouter,
} satisfies TRPCRouterRecord;
