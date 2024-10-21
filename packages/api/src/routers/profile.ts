import type { TRPCRouterRecord } from "@trpc/server";

import schema from "@repo/db/schema";

import { datatable } from "../lib/datatable";
import { publicProcedure } from "../trpc";

export const profileOverview = datatable(schema.profile);

export const profileRouter = {
  list: publicProcedure
    .input(profileOverview.inputSchema)
    .query(async ({ input }) => {
      return profileOverview.query(input);
    }),
} satisfies TRPCRouterRecord;

export type ProfileRouter = typeof profileRouter;
