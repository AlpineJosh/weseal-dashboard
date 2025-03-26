import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { batchQuery } from "../models/batch/query";
import { publicProcedure } from "../trpc";

export const uniqueBatchSchema = z.object({
  id: z.number(),
});

export const batchRouter = {
  get: publicProcedure.input(uniqueBatchSchema).query(async ({ input }) => {
    return await batchQuery.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure.input(batchQuery.$schema).query(async ({ input }) => {
    return batchQuery.findMany(input);
  }),
} satisfies TRPCRouterRecord;

export type BatchRouter = typeof batchRouter;
