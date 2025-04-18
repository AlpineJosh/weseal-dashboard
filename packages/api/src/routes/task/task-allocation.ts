import { TRPCError } from "@trpc/server";
import { db } from "#db";
import { completeTaskAllocation } from "#models/task/allocation";
import { taskAllocationQuery } from "#models/task/query";
import { publicProcedure } from "#trpc";
import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";

const uniqueTaskAllocationInput = z.object({
  id: z.number(),
});

export const taskAllocationRouter = {
  get: publicProcedure
    .input(uniqueTaskAllocationInput)
    .query(async ({ input }) => {
      return await taskAllocationQuery.findFirst({
        filter: { id: { eq: input.id } },
      });
    }),
  list: publicProcedure
    .input(taskAllocationQuery.$schema)
    .query(async ({ input, ctx }) => {
      try {
        const results = await taskAllocationQuery.findMany(input);
        return results;
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) {
          console.error(error.message);
        }
        throw error;
      }
    }),
  complete: publicProcedure
    .input(uniqueTaskAllocationInput)
    .mutation(async ({ input, ctx }) => {
      await db.transaction(async (tx) => {
        await completeTaskAllocation(tx, {
          taskAllocationId: input.id,
          userId: ctx.user.id,
        });
      });
    }),
} satisfies TRPCRouterRecord;

export type TaskAllocationRouter = typeof taskAllocationRouter;
