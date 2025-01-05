import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../../db";
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

const taskOverview = datatable(schema.base.taskOverview);

export const taskRouter = {
  get: publicProcedure.input(uniqueTaskInput).query(async ({ input }) => {
    return await db.query.taskOverview.findFirst({
      where: eq(schema.base.taskOverview.id, input.id),
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
        .insert(schema.base.task)
        .values({
          ...input,
          createdById: input.assignedToId,
        })
        .returning({
          id: schema.base.task.id,
        });
      const task = result[0];

      if (!task) {
        throw new Error("Failed to create task");
      }

      await tx.insert(schema.base.taskItem).values(
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
      .update(schema.base.task)
      .set({ isCancelled: true })
      .where(eq(schema.base.task.id, input.id))
      .returning();
  }),
  delete: publicProcedure.input(uniqueTaskInput).mutation(async ({ input }) => {
    return await db
      .delete(schema.base.task)
      .where(eq(schema.base.task.id, input.id))
      .returning();
  }),
  items: taskItemRouter,
} satisfies TRPCRouterRecord;
