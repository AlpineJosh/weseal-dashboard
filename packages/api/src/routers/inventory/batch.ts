import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../db";
import { datatable } from "../../lib/datatable";
import { publicProcedure } from "../../trpc";

const uniqueBatchInput = z.object({
  id: z.number(),
});
const batchOverview = datatable(schema.base.batchOverview);

export const batchRouter = {
  get: publicProcedure.input(uniqueBatchInput).query(async ({ input }) => {
    return await db.query.batchOverview.findFirst({
      where: eq(schema.base.batchOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(batchOverview.inputSchema)
    .query(async ({ input }) => {
      return await batchOverview.query(input);
    }),
} satisfies TRPCRouterRecord;
