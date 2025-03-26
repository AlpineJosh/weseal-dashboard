import { supplierQuery } from "#models/receiving/query";
import { publicProcedure } from "#trpc";
import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";

export const uniqueSupplierSchema = z.object({
  id: z.string(),
});

export const supplierRouter = {
  get: publicProcedure.input(uniqueSupplierSchema).query(async ({ input }) => {
    return await supplierQuery.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure
    .input(supplierQuery.$schema)
    .query(async ({ input }) => {
      return supplierQuery.findMany(input);
    }),
} satisfies TRPCRouterRecord;

export type SupplierRouter = typeof supplierRouter;
