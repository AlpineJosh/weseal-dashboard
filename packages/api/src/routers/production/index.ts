import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { createTRPCRouter, publicProcedure } from "../../trpc";
import { productionJobOutputRouter } from "./output";
import { productionJobResourcesRouter } from "./resources";

export const uniqueProductionJobInput = z.object({
  id: z.number(),
});

export const listProductionJobInput = z.object({
  pagination: z.object({
    page: z.number(),
    size: z.number(),
  }),
  filter: z.object({
    componentId: z.string(),
  }),
});

export const createProductionJobInput = z.object({
  componentId: z.string(),
  batchReference: z.string(),
  targetQuantity: z.number(),
});

export const updateProductionJobInput = z.object({
  id: z.number(),
  targetQuantity: z.number(),
  isActive: z.boolean(),
});

export const productionRouter = createTRPCRouter({
  get: publicProcedure
    .input(uniqueProductionJobInput)
    .query(async ({ input }) => {
      return await db.query.productionJob.findFirst({
        where: eq(schema.productionJob.id, input.id),
        with: {
          batchesIn: true,
        },
      });
    }),
  list: publicProcedure
    .input(listProductionJobInput)
    .query(async ({ input }) => {
      return await db.query.productionJob.findMany({
        limit: input.pagination.size,
        offset: (input.pagination.page - 1) * input.pagination.size,
        where: input.filter.componentId
          ? eq(schema.productionJob.componentId, input.filter.componentId)
          : undefined,
        with: {
          batchesIn: true,
        },
      });
    }),
  create: publicProcedure
    .input(createProductionJobInput)
    .mutation(async ({ input }) => {
      return await db.insert(schema.productionJob).values(input).returning();
    }),
  update: publicProcedure
    .input(updateProductionJobInput)
    .mutation(async ({ input }) => {
      return await db
        .update(schema.productionJob)
        .set(input)
        .where(eq(schema.productionJob.id, input.id))
        .returning();
    }),
  resources: productionJobResourcesRouter,
  output: productionJobOutputRouter,
});

export type ProductionRouter = typeof productionRouter;
