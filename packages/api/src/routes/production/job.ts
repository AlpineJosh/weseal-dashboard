import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";
import {
  addToProductionJob,
  completeProductionJob,
  createProductionJobTask,
  processProductionOut,
} from "@/models/production/job";
import { productionJobQuery } from "@/models/production/query";
import { db } from "../../db";
import { decimal } from "../../lib/decimal";
import { publicProcedure } from "../../trpc";
import { productionAllocationRouter } from "./allocation";

const uniqueProductionJobInput = z.object({
  id: z.number(),
});

const taskAllocationInput = z.object({
  reference: z.object({
    componentId: z.string(),
    batchId: z.number().nullable(),
  }),
  quantity: decimal(),
  pickLocationId: z.number(),
  putLocationId: z.number(),
});

const createProductionTaskInput = z.object({
  assignedToId: z.string(),
  componentId: z.string(),
  outputLocationId: z.number(),
  inputLocationId: z.number(),
  batchReference: z.string(),
  targetQuantity: decimal(),
  allocations: z.array(taskAllocationInput),
});

const addToProductionJobInput = z.object({
  id: z.number(),
  allocations: z.array(taskAllocationInput),
  assignedToId: z.string(),
  additionalQuantity: decimal(),
  inputLocationId: z.number(),
});

const processOutputInput = z.object({
  id: z.number(),
  quantity: decimal(),
});

const completeProductionJobInput = z.object({
  id: z.number(),
  remainingQuantities: z.array(
    z.object({
      reference: z.object({
        componentId: z.string(),
        batchId: z.number().nullable(),
      }),
      quantity: decimal(),
    }),
  ),
});

export const productionJobRouter = {
  get: publicProcedure
    .input(uniqueProductionJobInput)
    .query(async ({ input }) => {
      return await productionJobQuery.findFirst({
        filter: { id: { eq: input.id } },
      });
    }),
  list: publicProcedure
    .input(productionJobQuery.$schema)
    .query(async ({ input }) => {
      return productionJobQuery.findMany(input);
    }),

  allocations: productionAllocationRouter,

  createJobTask: publicProcedure
    .input(createProductionTaskInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        await createProductionJobTask(tx, {
          ...input,
          userId: ctx.user.id,
        });
      });
    }),
  addToJob: publicProcedure
    .input(addToProductionJobInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        await addToProductionJob(tx, {
          ...input,
          userId: ctx.user.id,
        });
      });
    }),

  processOutput: publicProcedure
    .input(processOutputInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        await processProductionOut(tx, {
          ...input,
          userId: ctx.user.id,
        });
      });
    }),

  completeJob: publicProcedure
    .input(completeProductionJobInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        await completeProductionJob(tx, {
          ...input,
          userId: ctx.user.id,
        });
      });
    }),
} satisfies TRPCRouterRecord;

export type ProductionJobRouter = typeof productionJobRouter;
