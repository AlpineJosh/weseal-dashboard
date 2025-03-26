import { customerQuery } from "#models/despatching/query";
import { publicProcedure } from "#trpc";
import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";

export const uniqueCustomerSchema = z.object({
  id: z.string(),
});

export const customerRouter = {
  get: publicProcedure.input(uniqueCustomerSchema).query(async ({ input }) => {
    return await customerQuery.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure
    .input(customerQuery.$schema)
    .query(async ({ input }) => {
      return customerQuery.findMany(input);
    }),
} satisfies TRPCRouterRecord;

export type CustomerRouter = typeof customerRouter;
