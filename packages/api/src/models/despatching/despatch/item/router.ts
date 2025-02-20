import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { publicProcedure } from "../../../../trpc";
import overview from "./model";

export const uniqueDespatchItemSchema = z.object({
  id: z.number(),
});

export const despatchItemRouter = {
  get: publicProcedure
    .input(uniqueDespatchItemSchema)
    .query(async ({ input }) => {
      return await overview.findFirst({ filter: { id: { eq: input.id } } });
    }),
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
  }),
} satisfies TRPCRouterRecord;

export type DespatchItemRouter = typeof despatchItemRouter;
