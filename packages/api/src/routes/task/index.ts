import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";
import { db } from "@/db";
import { taskQuery } from "@/models/task/query";
import { cancelTask } from "@/models/task/task";
import { publicProcedure } from "../../trpc";
import { taskAllocationRouter } from "./task-allocation";

const uniqueTaskInput = z.object({
  id: z.number(),
});

export const taskRouter = {
  get: publicProcedure.input(uniqueTaskInput).query(async ({ input }) => {
    return await taskQuery.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure.input(taskQuery.$schema).query(async ({ input }) => {
    return taskQuery.findMany(input);
  }),

  cancel: publicProcedure.input(uniqueTaskInput).mutation(async ({ input }) => {
    return await db.transaction(async (tx) => {
      return await cancelTask(tx, input.id);
    });
  }),
  allocations: taskAllocationRouter,
} satisfies TRPCRouterRecord;

export type TaskRouter = typeof taskRouter;
