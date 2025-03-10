import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../../db";
import { publicProcedure } from "../../../trpc";
import { completeTaskAllocation } from "../model";
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
      await db.transaction(async (tx) => {
        const taskItem = await tx.query.taskAllocation.findFirst({
          where: eq(schema.taskAllocation.id, input.id),
          with: {
            task: true,
          },
        });

        if (!taskItem) {
          throw new Error("Task item not found");
        }
        await completeTaskAllocation(tx, taskItem.id, ctx.user.id);
      });
      return { success: true };
    }),
} satisfies TRPCRouterRecord;

export type TaskItemRouter = typeof taskItemRouter;
