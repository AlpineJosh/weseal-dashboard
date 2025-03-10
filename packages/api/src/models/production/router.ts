import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq, publicSchema } from "@repo/db";

import { db } from "../../db";
import { decimal } from "../../lib/decimal";
import { publicProcedure } from "../../trpc";
import { allocateToTask, processProductionOut } from "../inventory/model";
// import { processAllocateLedgerEntry } from "../inventory/model";
import overview from "./model";

const uniqueProductionJobInput = z.object({
  id: z.number(),
});

const taskItemInput = z.object({
  componentId: z.string(),
  batchId: z.number().optional(),
  locationId: z.number(),
  quantity: decimal(),
});

const createProductionTaskInput = z.object({
  assignedToId: z.string(),
  componentId: z.string(),
  outputLocationId: z.number(),
  inputLocationId: z.number(),
  batchReference: z.string(),
  targetQuantity: decimal(),
  items: z.array(taskItemInput),
});

const addToProductionJobInput = z.object({
  id: z.number(),
  items: z.array(taskItemInput),
  assignedToId: z.string(),
  additionalQuantity: decimal(),
  inputLocationId: z.number(),
});

const processOutputInput = z.object({
  id: z.number(),
  quantity: decimal(),
});

export const productionRouter = {
  get: publicProcedure
    .input(uniqueProductionJobInput)
    .query(async ({ input }) => {
      return await overview.findFirst({ filter: { id: { eq: input.id } } });
    }),
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
  }),
  createJobTask: publicProcedure
    .input(createProductionTaskInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        let batchId: number | undefined;
        if (input.batchReference) {
          const batches = await tx
            .insert(publicSchema.batch)
            .values({
              batchReference: input.batchReference,
              componentId: input.componentId,
            })
            .returning();
          const batch = batches[0];

          if (!batch) {
            throw new Error("Batch not found");
          }

          batchId = batch.id;
        }

        const jobs = await tx
          .insert(publicSchema.productionJob)
          .values({
            componentId: input.componentId,
            batchId,
            outputLocationId: input.outputLocationId,
            targetQuantity: input.targetQuantity,
          })
          .returning();

        const job = jobs[0];

        if (!job) {
          throw new Error("Failed to create production job");
        }

        const tasks = await tx
          .insert(publicSchema.task)
          .values({
            type: "production",
            productionJobId: job.id,
            assignedToId: input.assignedToId,
            createdById: ctx.user.id,
          })
          .returning();

        const task = tasks[0];

        if (!task) {
          throw new Error("Failed to create production task");
        }

        for (const item of input.items) {
          await allocateToTask(
            tx,
            {
              componentId: item.componentId,
              batchId: item.batchId,
            },
            item.quantity,
            task.id,
            item.locationId,
            input.inputLocationId,
          );
        }
      });
    }),
  addToJob: publicProcedure
    .input(addToProductionJobInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        const tasks = await tx
          .insert(publicSchema.task)
          .values({
            type: "production",
            productionJobId: input.id,
            assignedToId: input.assignedToId,
            createdById: ctx.user.id,
          })
          .returning();

        const task = tasks[0];
        if (!task) {
          throw new Error("Failed to create task");
        }

        for (const item of input.items) {
          await allocateToTask(
            tx,
            {
              componentId: item.componentId,
              batchId: item.batchId,
            },
            item.quantity,
            task.id,
            item.locationId,
            input.inputLocationId,
          );
        }
      });
    }),

  processOutput: publicProcedure
    .input(processOutputInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        await processProductionOut(tx, input.id, input.quantity, ctx.user.id);
      });
    }),
} satisfies TRPCRouterRecord;

export type ProductionRouter = typeof productionRouter;
