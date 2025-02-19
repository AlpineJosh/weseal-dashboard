import type { TRPCRouterRecord } from "@trpc/server";

import { publicProcedure } from "../../../trpc";
import overview from "./model";

export const subcomponentRouter = {
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
  }),
} satisfies TRPCRouterRecord;

export type SubcomponentRouter = typeof subcomponentRouter;
