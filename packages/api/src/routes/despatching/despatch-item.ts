import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";
import { despatchItemQuery } from "@/models/despatching/query";
import { publicProcedure } from "@/trpc";

export const uniqueDespatchItemSchema = z.object({
  id: z.number(),
});

export const despatchItemRouter = {
  get: publicProcedure
    .input(uniqueDespatchItemSchema)
    .query(async ({ input }) => {
      return await despatchItemQuery.findFirst({
        filter: { id: { eq: input.id } },
      });
    }),
  list: publicProcedure
    .input(despatchItemQuery.$schema)
    .query(async ({ input }) => {
      return despatchItemQuery.findMany(input);
    }),
} satisfies TRPCRouterRecord;

export type DespatchItemRouter = typeof despatchItemRouter;
