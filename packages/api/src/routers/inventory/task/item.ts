import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import type { InferInsertModel } from "@repo/db";
import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";

const uniqueTaskItemInput = z.object({
  id: z.number(),
});

const taskItemOverview = datatable(schema.taskItemOverview);

export const taskItemRouter = {
  get: publicProcedure.input(uniqueTaskItemInput).query(async ({ input }) => {
    return await db.query.taskItemOverview.findFirst({
      where: eq(schema.taskItemOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(taskItemOverview.inputSchema)
    .query(async ({ input }) => {
      return await taskItemOverview.query(input);
    }),
  complete: publicProcedure
    .input(uniqueTaskItemInput)
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const taskItem = await tx.query.taskItem.findFirst({
          where: eq(schema.taskItem.id, input.id),
          with: {
            task: true,
          },
        });

        if (!taskItem) {
          throw new Error("Task item not found");
        }

        if (taskItem.isComplete) {
          throw new Error("Task item already completed");
        }

        if (taskItem.task.isCancelled) {
          throw new Error("Task item already cancelled");
        }

        const values: InferInsertModel<typeof schema.batchMovement>[] = [];
        if (taskItem.pickLocationId) {
          values.push({
            date: new Date(),
            batchId: taskItem.batchId,
            locationId: taskItem.pickLocationId,
            quantity: -taskItem.quantity,
            userId: taskItem.task.assignedToId,
            type: taskItem.task.type,
            salesDespatchItemId: taskItem.task.salesDespatchId,
            productionBatchInputId: taskItem.task.productionJobId,
          });
        }
        if (taskItem.putLocationId) {
          values.push({
            date: new Date(),
            batchId: taskItem.batchId,
            locationId: taskItem.putLocationId,
            quantity: taskItem.quantity,
            userId: taskItem.task.assignedToId,
            type: taskItem.task.type,
            salesDespatchItemId: taskItem.task.salesDespatchId,
            productionBatchOutputId: taskItem.task.productionJobId,
          });
        }

        await tx.insert(schema.batchMovement).values(values);

        await tx
          .update(schema.taskItem)
          .set({
            isComplete: true,
          })
          .where(eq(schema.taskItem.id, input.id));
      });
      return { success: true };
    }),
  delete: publicProcedure
    .input(uniqueTaskItemInput)
    .mutation(async ({ input }) => {
      return await db
        .delete(schema.taskItem)
        .where(eq(schema.task.id, input.id))
        .returning();
    }),
} satisfies TRPCRouterRecord;
