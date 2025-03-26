import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";
import { orderItemQuery } from "@/models/despatching/query";
import { publicProcedure } from "@/trpc";

export const uniqueOrderItemSchema = z.object({
  id: z.number(),
});

export const orderItemRouter = {
  get: publicProcedure.input(uniqueOrderItemSchema).query(async ({ input }) => {
    return await orderItemQuery.findFirst({
      filter: { id: { eq: input.id } },
    });
  }),
  list: publicProcedure
    .input(orderItemQuery.$schema)
    .query(async ({ input }) => {
      return orderItemQuery.findMany(input);
    }),
} satisfies TRPCRouterRecord;

export type OrderItemRouter = typeof orderItemRouter;
