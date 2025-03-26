import { orderQuery } from "#models/receiving/query";
import { orderItemRouter } from "#routes/receiving/order-item";
import { publicProcedure } from "#trpc";
import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";

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
  items: orderItemRouter,
} satisfies TRPCRouterRecord;

export type OrderRouter = typeof orderRouter;
