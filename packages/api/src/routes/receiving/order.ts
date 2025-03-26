import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";
import { orderQuery } from "@/models/receiving/query";
import { publicProcedure } from "@/trpc";

export const uniqueOrderSchema = z.object({
  id: z.number(),
});

export const orderRouter = {
  get: publicProcedure.input(uniqueOrderSchema).query(async ({ input }) => {
    return await orderQuery.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure.input(orderQuery.$schema).query(async ({ input }) => {
    return orderQuery.findMany(input);
  }),
} satisfies TRPCRouterRecord;

export type OrderRouter = typeof orderRouter;
