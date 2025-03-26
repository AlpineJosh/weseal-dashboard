import { z } from "zod";

import { eq, publicSchema } from "@repo/db";

import type { TRPCRouterRecord } from "@trpc/server";
import { db } from "@/db";
import { decimal } from "@/lib/decimal";
import { createDespatchTask } from "@/models/despatching/despatch";
import { despatchQuery } from "@/models/despatching/query";
import { publicProcedure } from "@/trpc";

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

export const createDespatchTaskSchema = z.object({
  orderId: z.number(),
  assignedToId: z.string(),
  allocations: z.array(
    z.object({
      reference: z.object({
        componentId: z.string(),
        batchId: z.number().nullable(),
      }),
      pickLocationId: z.number(),
      quantity: decimal(),
    }),
  ),
});

export const despatchRouter = {
  get: publicProcedure.input(uniqueDespatchSchema).query(async ({ input }) => {
    return await despatchQuery.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure
    .input(despatchQuery.$schema)
    .query(async ({ input }) => {
      return despatchQuery.findMany(input);
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
  createDespatchTask: publicProcedure
    .input(createDespatchTaskSchema)
    .mutation(async ({ input, ctx }) => {
      await db.transaction(async (tx) => {
        await createDespatchTask(tx, {
          ...input,
          createdById: ctx.user.id,
        });
      });
    }),
} satisfies TRPCRouterRecord;

export type DespatchRouter = typeof despatchRouter;
