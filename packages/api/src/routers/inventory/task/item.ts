import type { TRPCRouterRecord } from "@trpc/server";
import { Decimal } from "decimal.js";
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
      where: eq(schema.base.taskItemOverview.displayId, input.id),
    });
  }),
  list: publicProcedure
    .input(taskItemOverview.inputSchema)
    .query(async ({ input }) => {
      console.log(input);
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

        const movement: InferInsertModel<typeof schema.base.batchMovement> = {
          date: new Date(),
          batchId: taskItem.batchId,
          userId: ctx.user.id,
          type: taskItem.task.type,
          quantity: new Decimal(0),
          locationId: 0,
        };

        if (
          taskItem.task.type === "production" &&
          taskItem.task.productionJobId &&
          taskItem.pickLocationId
        ) {
          const productionJobItems = await tx
            .insert(schema.base.productionBatchInput)
            .values({
              jobId: taskItem.task.productionJobId,
              batchId: taskItem.batchId,
              quantityAllocated: taskItem.quantity,
              quantityUsed: new Decimal(0),
              locationId: taskItem.pickLocationId,
            })
            .returning({ id: schema.base.productionBatchInput.id });

          const productionJobItem = productionJobItems[0];
          if (!productionJobItem) {
            throw new Error("Failed to create production job item");
          }

          movement.productionBatchInputId = productionJobItem.id;
        }

        if (
          taskItem.task.type === "despatch" &&
          taskItem.task.salesDespatchId
        ) {
          const salesDespatchItems = await tx
            .insert(schema.base.salesDespatchItem)
            .values({
              despatchId: taskItem.task.salesDespatchId,
              batchId: taskItem.batchId,
              quantity: taskItem.quantity,
            })
            .returning({ id: schema.base.salesDespatchItem.id });

          const salesDespatchItem = salesDespatchItems[0];
          if (!salesDespatchItem) {
            throw new Error("Failed to create sales despatch item");
          }
        }

        if (taskItem.pickLocationId) {
          await tx.insert(schema.base.batchMovement).values({
            ...movement,
            locationId: taskItem.pickLocationId,
            quantity: taskItem.quantity.neg(),
          });
        }

        if (taskItem.putLocationId) {
          await tx.insert(schema.base.batchMovement).values({
            ...movement,
            locationId: taskItem.putLocationId,
            quantity: taskItem.quantity,
          });
        }

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
