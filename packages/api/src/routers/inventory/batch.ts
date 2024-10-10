import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { count, eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../lib/datatable";
import { publicProcedure } from "../../trpc";

const uniqueBatchInput = z.object({
  id: z.number(),
});
const batchOverview = datatable(schema.batchOverview);

export const batchRouter = {
  get: publicProcedure.input(uniqueBatchInput).query(async ({ input }) => {
    return await db.query.batchOverview.findFirst({
      where: eq(schema.batchOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(batchOverview.inputSchema)
    .query(async ({ input }) => {
      return await batchOverview.query(input);
    }),
} satisfies TRPCRouterRecord;
