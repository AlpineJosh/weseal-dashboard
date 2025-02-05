import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../db";
import { decimal } from "../../lib/decimal";
import { publicProcedure } from "../../trpc";
import overview from "./model";

const uniqueProductionJobInput = z.object({
  id: z.number(),
});

const createProductionJobInput = z.object({
  outputComponentId: z.string(),
  outputLocationId: z.number(),
  batchReference: z.string(),
  targetQuantity: decimal(),
});

const updateProductionJobInput = z.object({
  id: z.number(),
  targetQuantity: decimal(),
  isActive: z.boolean(),
  outputLocationId: z.number(),
});

const jobOutputInput = z.object({
  id: z.number(),
  quantity: decimal(),
});

export const productionRouter = {
  get: publicProcedure
    .input(uniqueProductionJobInput)
    .query(async ({ input }) => {
      return await overview.findFirst({ filter: { id: { eq: input.id } } });
    }),
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
  }),
} satisfies TRPCRouterRecord;

export type ProductionRouter = typeof productionRouter;
