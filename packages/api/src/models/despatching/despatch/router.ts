import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, publicSchema } from "@repo/db";

import { db } from "../../../db";
import { decimal } from "../../../lib/decimal";
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

export const createDespatchTaskSchema = z.object({
  orderId: z.number(),
  assignedToId: z.string(),
  items: z.array(
    z.object({
      componentId: z.string(),
      batchId: z.number().optional(),
      locationId: z.number(),
      quantity: decimal(),
    }),
  ),
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
  createDespatchTask: publicProcedure
    .input(createDespatchTaskSchema)
    .mutation(async ({ input, ctx }) => {
      const despatches = await db
        .insert(publicSchema.salesDespatch)
        .values({
          orderId: input.orderId,
          despatchDate: new Date(),
        })
        .returning({
          id: publicSchema.salesDespatch.id,
        });

      const despatch = despatches[0];

      if (!despatch) {
        throw new Error("Failed to create despatch");
      }

      const tasks = await db
        .insert(publicSchema.task)
        .values({
          salesDespatchId: despatch.id,
          type: "despatch",
          createdById: ctx.user.id,
          assignedToId: input.assignedToId,
        })
        .returning({
          id: publicSchema.task.id,
        });

      const task = tasks[0];

      if (!task) {
        throw new Error("Failed to create task");
      }

      await db.transaction(async (tx) => {
        // for (const item of input.items) {
        //   const lots = await getLotsToConsume(tx, {
        //     lot: {
        //       componentId: item.componentId,
        //       batchId: item.batchId,
        //     },
        //     locationId: item.locationId,
        //     isAllocated: false,
        //   }, item.quantity);
        //   tx.insert(publicSchema.taskAllocation).values(lots.map((lot) => ({
        // return await tx.insert(publicSchema.taskAllocation).values(input.items.map((item) => ({
        //   taskId: task.id,
        //   componentId: item.componentId,
        //   batchId: item.batchId,
        // })));
      });

      // return await db
      //   .insert(publicSchema.salesDespatchTask)
      //   .values(input.data)
      //   .returning();
    }),
} satisfies TRPCRouterRecord;

export type SalesDespatchRouter = typeof salesDespatchRouter;
