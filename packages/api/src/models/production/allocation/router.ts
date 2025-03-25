import { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { publicProcedure } from "../../../trpc";
import overview from "./model";

const uniqueProductionJobAllocationInput = z.object({
  id: z.number(),
});

export const productionAllocationRouter = {
  get: publicProcedure
    .input(uniqueProductionJobAllocationInput)
    .query(async ({ input }) => {
      return await overview.findFirst({ filter: { id: { eq: input.id } } });
    }),
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
  }),
} satisfies TRPCRouterRecord;

export type ProductionAllocationRouter = typeof productionAllocationRouter;
