import type { TRPCRouterRecord } from "@trpc/server";

import { publicProcedure } from "../../../trpc";
import overview from "./model";

export const ledgerRouter = {
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return await overview.findMany(input);
  }),
} satisfies TRPCRouterRecord;
