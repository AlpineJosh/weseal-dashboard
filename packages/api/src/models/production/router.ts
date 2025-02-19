import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq, publicSchema } from "@repo/db";

import { db } from "../../db";
import { decimal } from "../../lib/decimal";
import { publicProcedure } from "../../trpc";
// import { processAllocateLedgerEntry } from "../inventory/model";
import overview from "./model";

const uniqueProductionJobInput = z.object({
  id: z.number(),
});

const taskItemInput = z.object({
  componentId: z.string(),
  batchId: z.number(),
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
        let batch;
        if (input.batchReference) {
          let batches = await tx
            .select()
            .from(publicSchema.batch)
            .where(
              and(
                eq(publicSchema.batch.batchReference, input.batchReference),
                eq(publicSchema.batch.componentId, input.componentId),
              ),
            );
          if (batches.length === 0) {
            batches = await tx
              .insert(publicSchema.batch)
              .values({
                batchReference: input.batchReference,
                componentId: input.componentId,
              })
              .returning();

            if (batches.length === 0) {
              throw new Error("Failed to create batch");
            }
          }
          batch = batches[0];
        }

        const productionJobs = await tx
          .insert(publicSchema.productionJob)
          .values({
            componentId: input.componentId,
            outputLocationId: input.outputLocationId,
            batchId: batch?.id,
            targetQuantity: input.targetQuantity,
          })
          .returning();

        const productionJob = productionJobs[0];
        if (!productionJob) {
          throw new Error("Failed to create production job");
        }

        const tasks = await tx
          .insert(publicSchema.task)
          .values({
            type: "production",
            productionJobId: productionJob.id,
            assignedToId: input.assignedToId,
            createdById: ctx.user.id,
          })
          .returning();

        const task = tasks[0];
        if (!task) {
          throw new Error("Failed to create task");
        }

        await tx.insert(publicSchema.taskAllocation).values(
          input.items.map((item) => ({
            taskId: task.id,
            componentId: item.componentId,
            batchId: item.batchId,
            pickLocationId: item.locationId,
            putLocationId: input.inputLocationId,
            quantity: item.quantity,
          })),
        );

        // await Promise.all(
        //   input.items.map((item) =>
        //     processAllocateLedgerEntry({
        //       componentId: item.componentId,
        //       batchId: item.batchId,
        //       locationId: item.locationId,
        //       quantity: item.quantity,
        //       type: "transfer",
        //       userId: input.assignedToId,
        //     }),
        //   ),
        // );
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

        await tx.insert(publicSchema.taskAllocation).values(
          input.items.map((item) => ({
            taskId: task.id,
            componentId: item.componentId,
            batchId: item.batchId,
            pickLocationId: item.locationId,
            putLocationId: input.inputLocationId,
            quantity: item.quantity,
          })),
        );

        // await Promise.all(
        //   input.items.map((item) =>
        //     processAllocateLedgerEntry({
        //       componentId: item.componentId,
        //       batchId: item.batchId,
        //       locationId: item.locationId,
        //       quantity: item.quantity,
        //       type: "transfer",
        //       userId: input.assignedToId,
        //     }),
        //   ),
        // );
      });
    }),

  processOutput: publicProcedure
    .input(processOutputInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        const job = await tx.query.productionJob.findFirst({
          where: eq(publicSchema.productionJob.id, input.id),
        });

        if (!job) {
          throw new Error("Production job not found");
        }

        const wip = await tx.query.component.findFirst({
          where: eq(publicSchema.component.id, `${job.componentId}WIP`),
        });

        const componentId = wip ? wip.id : job.componentId;

        // const subcomponents = await tx.query.subcomponent.findMany({
        //   where: eq(publicSchema.subcomponent.componentId, componentId),
        // });

        // const batchInputs = await tx.query.productionBatchInput.findMany({
        //   where: eq(publicSchema.productionBatchInput.jobId, input.id),
        //   with: {
        //     batch: true,
        //   },
        // });
      });
    }),
} satisfies TRPCRouterRecord;

export type ProductionRouter = typeof productionRouter;
