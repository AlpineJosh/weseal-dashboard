import { ledgerQuery } from "#models/inventory/query";
import { publicProcedure } from "#trpc";

import type { TRPCRouterRecord } from "@trpc/server";

export const ledgerRouter = {
  list: publicProcedure.input(ledgerQuery.$schema).query(async ({ input }) => {
    return await ledgerQuery.findMany(input);
  }),
} satisfies TRPCRouterRecord;
