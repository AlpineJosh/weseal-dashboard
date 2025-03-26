import type { TRPCRouterRecord } from "@trpc/server";
import { ledgerQuery } from "@/models/inventory/query";
import { publicProcedure } from "@/trpc";

export const ledgerRouter = {
  list: publicProcedure.input(ledgerQuery.$schema).query(async ({ input }) => {
    return await ledgerQuery.findMany(input);
  }),
} satisfies TRPCRouterRecord;
