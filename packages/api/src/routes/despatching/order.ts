import { orderQuery } from "#models/despatching/query";
import { orderItemRouter } from "#routes/despatching/order-item";
import { publicProcedure } from "#trpc";
import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";

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
  items: orderItemRouter,
} satisfies TRPCRouterRecord;

export type OrderRouter = typeof orderRouter;
