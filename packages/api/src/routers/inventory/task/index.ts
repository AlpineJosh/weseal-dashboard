import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { count, eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";
import { taskItemRouter } from "./item";

const uniqueTaskInput = z.object({
  id: z.number(),
});

const createTaskInput = z.object({
  assignedToId: z.string(),
  productionJobId: z.number().optional(),
  purchaseOrderId: z.number().optional(),
  salesOrderId: z.number().optional(),
  type: z.enum(["transfer", "production", "despatch", "receipt"]),
  items: z.array(
    z.object({
      pickLocationId: z.number().optional(),
      putLocationId: z.number().optional(),
      batchId: z.number(),
      quantity: z.number(),
    }),
  ),
});

const taskOverview = datatable(schema.taskOverview);

export const taskRouter = {
  get: publicProcedure.input(uniqueTaskInput).query(async ({ input }) => {
    return await db.query.taskOverview.findFirst({
      where: eq(schema.taskOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(taskOverview.inputSchema)
    .query(async ({ input }) => {
      return await taskOverview.query(input);
    }),
  create: publicProcedure.input(createTaskInput).mutation(async ({ input }) => {
    console.log(input);
    const taskId = await db.transaction(async (tx) => {
      const result = await tx
        .insert(schema.task)
        .values({
          ...input,
          createdById: input.assignedToId,
        })
        .returning({
          id: schema.task.id,
        });
      const task = result[0];

      if (!task) {
        throw new Error("Failed to create task");
      }

      await tx.insert(schema.taskItem).values(
        input.items.map((item) => ({
          ...item,
          taskId: task.id,
        })),
      );

      return task.id;
    });

    return { id: taskId };
  }),
  cancel: publicProcedure.input(uniqueTaskInput).mutation(async ({ input }) => {
    return await db
      .update(schema.task)
      .set({ isCancelled: true })
      .where(eq(schema.task.id, input.id))
      .returning();
  }),
  delete: publicProcedure.input(uniqueTaskInput).mutation(async ({ input }) => {
    return await db
      .delete(schema.task)
      .where(eq(schema.task.id, input.id))
      .returning();
  }),
  items: taskItemRouter,
} satisfies TRPCRouterRecord;
