import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { publicProcedure } from "../trpc";

const uniqueTaskInput = z.object({
  id: z.number(),
});

const taskInput = z.object({
  assignedToId: z.string(),
  productionJobId: z.number().optional(),
  purchaseOrderId: z.number().optional(),
  salesOrderId: z.number().optional(),
  type: z.enum(["transfer", "production", "despatch", "receipt"]),
  items: z.array(
    z.object({
      componentId: z.string(),
      locationId: z.number(),
      batchId: z.number(),
      quantity: z.number(),
    }),
  ),
});

export const taskRouter = {
  get: publicProcedure.input(uniqueTaskInput).query(async ({ input }) => {
    return await db.query.task.findFirst({
      where: eq(schema.task.id, input.id),
      with: {
        productionJob: true,
        salesDespatch: true,
        items: true,
      },
    });
  }),
  list: publicProcedure.input(taskInput).query(async ({ input }) => {
    return await db.query.task.findMany({
      where: eq(schema.task.type, input.type),
      with: {
        productionJob: true,
        salesDespatch: true,
        items: true,
      },
    });
  }),
  create: publicProcedure.input(taskInput).mutation(async ({ input }) => {
    const result = await db
      .insert(schema.task)
      .values({
        ...input,
        createdById: "",
      })
      .returning();
    const task = result[0]!;

    const taskItems = await db
      .insert(schema.taskItem)
      .values(
        input.items.map((item) => ({
          ...item,
          taskId: task.id,
        })),
      )
      .returning();

    return { ...task, items: taskItems };
  }),
  completeItem: publicProcedure
    .input(uniqueTaskInput)
    .mutation(async ({ input }) => {
      return await db
        .update(schema.taskItem)
        .set({
          isComplete: true,
        })
        .where(eq(schema.taskItem.id, input.id))
        .returning();
    }),
  delete: publicProcedure.input(uniqueTaskInput).mutation(async ({ input }) => {
    return await db
      .delete(schema.task)
      .where(eq(schema.task.id, input.id))
      .returning();
  }),
} satisfies TRPCRouterRecord;
