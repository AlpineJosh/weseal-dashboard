import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, publicSchema } from "@repo/db";

import { db } from "../../../db";
import { decimal } from "../../../lib/decimal";
import { publicProcedure } from "../../../trpc";
import { allocateToTask } from "../../inventory/model";
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
      await db.transaction(async (tx) => {
        const despatches = await tx
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

        const tasks = await tx
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

        for (const item of input.items) {
          await allocateToTask(
            tx,
            {
              componentId: item.componentId,
              batchId: item.batchId,
            },
            item.quantity,
            task.id,
            item.locationId,
            undefined,
          );
        }
      });
    }),
} satisfies TRPCRouterRecord;

export type SalesDespatchRouter = typeof salesDespatchRouter;
