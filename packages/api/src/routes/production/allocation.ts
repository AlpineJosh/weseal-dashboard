import { productionJobAllocationQuery } from "#models/production/query";
import { publicProcedure } from "#trpc";
import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";

const uniqueProductionJobAllocationInput = z.object({
  id: z.number(),
});

export const productionAllocationRouter = {
  get: publicProcedure
    .input(uniqueProductionJobAllocationInput)
    .query(async ({ input }) => {
      return await productionJobAllocationQuery.findFirst({
        filter: { id: { eq: input.id } },
      });
    }),
  list: publicProcedure
    .input(productionJobAllocationQuery.$schema)
    .query(async ({ input }) => {
      return productionJobAllocationQuery.findMany(input);
    }),
} satisfies TRPCRouterRecord;

export type ProductionAllocationRouter = typeof productionAllocationRouter;
