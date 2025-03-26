import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";
import { orderQuery } from "@/models/despatching/query";
import { publicProcedure } from "@/trpc";

const uniqueOrderInput = z.object({
  id: z.number(),
});

export const orderRouter = {
  get: publicProcedure.input(uniqueOrderInput).query(async ({ input }) => {
    return await orderQuery.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure.input(orderQuery.$schema).query(async ({ input }) => {
    return orderQuery.findMany(input);
  }),
} satisfies TRPCRouterRecord;

export type OrderRouter = typeof orderRouter;
