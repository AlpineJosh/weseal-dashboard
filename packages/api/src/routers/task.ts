import type { AnyRouter } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { createTRPCRouter, publicProcedure } from "../trpc";

const uniqueTaskInput = z.object({
  id: z.number(),
});

const taskInput = z.object({
  assignedToId: z.string(),
  productionJobId: z.number().optional(),
  purchaseOrderId: z.number().optional(),
  salesOrderId: z.number().optional(),
  type: z.enum(["transfer", "production", "despatch", "receipt"]),
});

export const taskRouter: AnyRouter = createTRPCRouter({
  get: publicProcedure.input(uniqueTaskInput).query(async ({ input }) => {
    const t = await db.query.task.findFirst({
      where: eq(schema.task.id, input.id),
      with: {
        productionJob: true,
        salesDespatch: true,
        items: true,
      },
    });
    return t;
  }),
  list: publicProcedure.input(taskInput).query(async ({ input }) => {
    const t = await db.query.task.findMany({
      where: eq(schema.task.type, input.type),
      with: {
        productionJob: true,
        salesDespatch: true,
        items: true,
      },
    });
    return t;
  }),
  create: publicProcedure.input(taskInput).mutation(async ({ input }) => {
    const t = await db.insert(schema.task).values({
      ...input,
      createdById: "",
    });
    return t;
  }),
  completeItem: publicProcedure
    .input(uniqueTaskInput)
    .mutation(async ({ input }) => {
      const t = await db
        .update(schema.taskItem)
        .set({
          isComplete: true,
        })
        .where(eq(schema.taskItem.id, input.id));
      return t;
    }),
  delete: publicProcedure.input(uniqueTaskInput).mutation(async ({ input }) => {
    const t = await db.delete(schema.task).where(eq(schema.task.id, input.id));
    return t;
  }),
});

export type TaskRouter = typeof taskRouter;
