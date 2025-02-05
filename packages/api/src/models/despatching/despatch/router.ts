import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, publicSchema } from "@repo/db";

import { db } from "../../../db";
import { publicProcedure } from "../../../trpc";
import overview from "./model";

export const uniqueDespatchSchema = z.object({
  id: z.number(),
});

export const updateDespatchSchema = z.object({
  id: z.number(),
  data: z.object({
    orderId: z.number().optional(),
    expectedDespatchDate: z.date().optional(),
    despatchDate: z.date().optional(),
    isDespatched: z.boolean().optional(),
    isCancelled: z.boolean().optional(),
  }),
});

export const createDespatchSchema = z.object({
  data: z.object({
    orderId: z.number(),
    despatchDate: z.date(),
  }),
});

export const salesDespatchRouter = {
  get: publicProcedure.input(uniqueDespatchSchema).query(async ({ input }) => {
    return await overview.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
  }),
  update: publicProcedure
    .input(updateDespatchSchema)
    .mutation(async ({ input }) => {
      return await db
        .update(publicSchema.salesDespatch)
        .set(input.data)
        .where(eq(publicSchema.salesDespatch.id, input.id))
        .returning();
    }),
  create: publicProcedure
    .input(createDespatchSchema)
    .mutation(async ({ input }) => {
      return await db
        .insert(publicSchema.salesDespatch)
        .values(input.data)
        .returning();
    }),
} satisfies TRPCRouterRecord;

export type SalesDespatchRouter = typeof salesDespatchRouter;
