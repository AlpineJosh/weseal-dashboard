import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, publicSchema } from "@repo/db";

import { db } from "../../../db";
import { decimal } from "../../../lib/decimal";
import { publicProcedure } from "../../../trpc";
import overview from "./model";

const uniqueTaskItemInput = z.object({
  id: z.number(),
});

export const taskItemRouter = {
  get: publicProcedure.input(uniqueTaskItemInput).query(async ({ input }) => {
    return await overview.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
  }),
  complete: publicProcedure
    .input(uniqueTaskItemInput)
    .mutation(async ({ input, ctx }) => {
      // await db.transaction(async (tx) => {
      //   const taskItem = await tx.query.taskItem.findFirst({
      //     where: eq(publicSchema.taskItem.id, input.id),
      //     with: {
      //       task: true,
      //     },
      //   });

      //   if (!taskItem) {
      //     throw new Error("Task item not found");
      //   }

      //   if (taskItem.isComplete) {
      //     throw new Error("Task item already completed");
      //   }

      //   if (taskItem.task.isCancelled) {
      //     throw new Error("Task item already cancelled");
      //   }

      //   const movement = {
      //     date: new Date(),
      //     batchId: taskItem.batchId,
      //     userId: ctx.user.id,
      //     type: taskItem.task.type,
      //     quantity: decimal(0),
      //     locationId: 0,
      //   };

      //   if (
      //     taskItem.task.type === "production" &&
      //     taskItem.task.productionJobId &&
      //     taskItem.pickLocationId
      //   ) {
      //     const productionJobItems = await tx
      //       .insert(publicSchema.productionBatchInput)
      //       .values({
      //         jobId: taskItem.task.productionJobId,
      //         batchId: taskItem.batchId,
      //         quantityAllocated: taskItem.quantity,
      //         quantityUsed: decimal(0),
      //         locationId: taskItem.pickLocationId,
      //       })
      //       .returning({ id: publicSchema.productionBatchInput.id });

      //     const productionJobItem = productionJobItems[0];
      //     if (!productionJobItem) {
      //       throw new Error("Failed to create production job item");
      //     }

      //     movement.productionBatchInputId = productionJobItem.id;
      //   }

      //   if (
      //     taskItem.task.type === "despatch" &&
      //     taskItem.task.salesDespatchId
      //   ) {
      //     const salesDespatchItems = await tx
      //       .insert(publicSchema.salesDespatchItem)
      //       .values({
      //         despatchId: taskItem.task.salesDespatchId,
      //         batchId: taskItem.batchId,
      //         quantity: taskItem.quantity,
      //       })
      //       .returning({ id: publicSchema.salesDespatchItem.id });

      //     const salesDespatchItem = salesDespatchItems[0];
      //     if (!salesDespatchItem) {
      //       throw new Error("Failed to create sales despatch item");
      //     }
      //   }

      //   if (taskItem.pickLocationId) {
      //     await tx.insert(publicSchema.batchMovement).values({
      //       ...movement,
      //       locationId: taskItem.pickLocationId,
      //       quantity: taskItem.quantity.neg(),
      //     });
      //   }

      //   if (taskItem.putLocationId) {
      //     await tx.insert(publicSchema.batchMovement).values({
      //       ...movement,
      //       locationId: taskItem.putLocationId,
      //       quantity: taskItem.quantity,
      //     });
      //   }

      //   await tx
      //     .update(publicSchema.taskItem)
      //     .set({
      //       isComplete: true,
      //     })
      //     .where(eq(publicSchema.taskItem.id, input.id));
      // });
      return { success: true };
    }),
  delete: publicProcedure
    .input(uniqueTaskItemInput)
    .mutation(async ({ input }) => {
      return await db
        .delete(publicSchema.taskItem)
        .where(eq(publicSchema.taskItem.id, input.id))
        .returning();
    }),
} satisfies TRPCRouterRecord;

export type TaskItemRouter = typeof taskItemRouter;
