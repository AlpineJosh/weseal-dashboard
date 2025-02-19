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
  create: publicProcedure
    .input(createTaskInput)
    .mutation(async ({ input, ctx }) => {
      // return await db.transaction(async (tx) => {
      //   const task: typeof schema.base.task.$inferInsert = {
      //     type:
      //       input.type === "production-new" ||
      //       input.type === "production-existing"
      //         ? "production"
      //         : input.type,
      //     assignedToId: input.assignedToId,
      //     createdById: ctx.user.id,
      //   };
      //   const items: Omit<
      //     typeof schema.base.taskItem.$inferInsert,
      //     "taskId"
      //   >[] = input.items.map((item) => ({
      //     ...item,
      //     putLocationId:
      //       input.type !== "despatch" ? input.putLocationId : undefined,
      //   }));
      //   switch (input.type) {
      //     case "production-new": {
      //       const jobs = await tx
      //         .insert(schema.base.productionJob)
      //         .values({
      //           batchReference: input.batchReference,
      //           targetQuantity: input.quantity.toNumber(),
      //           outputComponentId: input.outputComponentId,
      //           outputLocationId: input.outputLocationId,
      //         })
      //         .returning();
      //       const job = jobs[0];
      //       if (!job) {
      //         throw new Error("Failed to create production job");
      //       }
      //       task.productionJobId = job.id;
      //       break;
      //     }
      //     case "production-existing": {
      //       await tx
      //         .update(schema.base.productionJob)
      //         .set({
      //           targetQuantity: sql`${schema.base.productionJob.targetQuantity} + ${input.quantity}`,
      //         })
      //         .where(eq(schema.base.productionJob.id, input.productionJobId));
      //       task.productionJobId = input.productionJobId;
      //       break;
      //     }
      //     case "despatch": {
      //       const despatches = await tx
      //         .insert(schema.base.salesDespatch)
      //         .values({
      //           orderId: input.salesOrderId,
      //           isDespatched: false,
      //         })
      //         .returning();
      //       const despatch = despatches[0];
      //       if (!despatch) {
      //         throw new Error("Failed to create despatch");
      //       }
      //       task.salesDespatchId = despatch.id;
      //       break;
      //     }
      //     case "transfer": {
      //       break;
      //     }
      //   }
      //   const createdTasks = await tx
      //     .insert(schema.base.task)
      //     .values(task)
      //     .returning({
      //       id: schema.base.task.id,
      //     });
      //   const createdTask = createdTasks[0];
      //   if (!createdTask) {
      //     throw new Error("Failed to create task");
      //   }
      //   await tx.insert(schema.base.taskItem).values(
      //     items.map((item) => ({
      //       ...item,
      //       taskId: createdTask.id,
      //     })),
      //   );
      //   return createdTask;
      // });
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
