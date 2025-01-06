import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import type { InferInsertModel } from "@repo/db";
import { eq, schema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";

const uniqueTaskItemInput = z.object({
  id: z.number(),
});

const taskItemOverview = datatable(schema.base.taskItemOverview);

export const taskItemRouter = {
  get: publicProcedure.input(uniqueTaskItemInput).query(async ({ input }) => {
    return await db.query.taskItemOverview.findFirst({
      where: eq(schema.base.taskItemOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(taskItemOverview.inputSchema)
    .query(async ({ input }) => {
      return await taskItemOverview.query(input);
    }),
  complete: publicProcedure
    .input(uniqueTaskItemInput)
    .mutation(async ({ input, ctx }) => {
      await db.transaction(async (tx) => {
        const taskItem = await tx.query.taskItem.findFirst({
          where: eq(schema.base.taskItem.id, input.id),
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

        const values: InferInsertModel<typeof schema.base.batchMovement>[] = [];
        if (taskItem.pickLocationId) {
          values.push({
            date: new Date(),
            batchId: taskItem.batchId,
            locationId: taskItem.pickLocationId,
            quantity: -taskItem.quantity,
            userId: ctx.user.id,
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
            userId: ctx.user.id,
            type: taskItem.task.type,
            salesDespatchItemId: taskItem.task.salesDespatchId,
            productionBatchOutputId: taskItem.task.productionJobId,
          });
        }

        await tx.insert(schema.base.batchMovement).values(values);

        await tx
          .update(schema.base.taskItem)
          .set({
            isComplete: true,
          })
          .where(eq(schema.base.taskItem.id, input.id));
      });
      return { success: true };
    }),
  delete: publicProcedure
    .input(uniqueTaskItemInput)
    .mutation(async ({ input }) => {
      return await db
        .delete(schema.base.taskItem)
        .where(eq(schema.base.taskItem.id, input.id))
        .returning();
    }),
} satisfies TRPCRouterRecord;
