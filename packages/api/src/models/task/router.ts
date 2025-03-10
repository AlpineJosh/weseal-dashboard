import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema, sql } from "@repo/db";

import { db } from "../../db";
import { decimal } from "../../lib/decimal";
import { publicProcedure } from "../../trpc";
import { taskItemRouter } from "./item/router";
import overview from "./model";

const uniqueTaskInput = z.object({
  id: z.number(),
});

const taskItemInput = z.object({
  componentId: z.string(),
  batchId: z.number(),
  pickLocationId: z.number(),
  quantity: decimal(),
});

const taskInput = z.object({
  assignedToId: z.string(),
  items: z.array(taskItemInput),
});

const productionTaskInput = taskInput.extend({
  quantity: decimal(),
  putLocationId: z.number(),
});

const newProductionTaskInput = productionTaskInput.extend({
  type: z.literal("production-new"),
  outputComponentId: z.string(),
  batchReference: z.string(),
  outputLocationId: z.number(),
});

const existingProductionTaskInput = productionTaskInput.extend({
  type: z.literal("production-existing"),
  productionJobId: z.number(),
});

const despatchTaskInput = taskInput.extend({
  type: z.literal("despatch"),
  salesOrderId: z.number(),
});

const transferTaskInput = taskInput.extend({
  type: z.literal("transfer"),
  putLocationId: z.number(),
});

const createTaskInput = z.discriminatedUnion("type", [
  newProductionTaskInput,
  existingProductionTaskInput,
  despatchTaskInput,
  transferTaskInput,
]);

export const taskRouter = {
  get: publicProcedure.input(uniqueTaskInput).query(async ({ input }) => {
    return await overview.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
  }),
  cancel: publicProcedure.input(uniqueTaskInput).mutation(async ({ input }) => {
    // return await db
    //   .update(schema.base.task)
    //   .set({ isCancelled: true })
    //   .where(eq(schema.base.task.id, input.id))
    //   .returning();
  }),
  delete: publicProcedure.input(uniqueTaskInput).mutation(async ({ input }) => {
    // return await db
    //   .delete(schema.base.task)
    //   .where(eq(schema.base.task.id, input.id))
    //   .returning();
  }),
  item: taskItemRouter,
} satisfies TRPCRouterRecord;

export type TaskRouter = typeof taskRouter;
