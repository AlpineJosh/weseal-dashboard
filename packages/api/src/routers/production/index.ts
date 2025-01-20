import type { TRPCRouterRecord } from "@trpc/server";
import Decimal from "decimal.js";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../db";
import { datatable } from "../../lib/datatable";
import { decimal } from "../../lib/decimal";
import { publicProcedure } from "../../trpc";
import { productionJobInputRouter } from "./input";

export const uniqueProductionJobInput = z.object({
  id: z.number(),
});

export const createProductionJobInput = z.object({
  outputComponentId: z.string(),
  outputLocationId: z.number(),
  batchReference: z.string(),
  targetQuantity: z.number(),
});

export const updateProductionJobInput = z.object({
  id: z.number(),
  targetQuantity: z.number(),
  isActive: z.boolean(),
  outputLocationId: z.number(),
});

export const jobOutputInput = z.object({
  id: z.number(),
  quantity: decimal(),
});

const listProductionJobInput = datatable(schema.base.productionJobOverview);

export const productionRouter = {
  get: publicProcedure
    .input(uniqueProductionJobInput)
    .query(async ({ input }) => {
      return await db.query.productionJob.findFirst({
        where: eq(schema.base.productionJob.id, input.id),
        with: {
          inputs: {
            with: {
              batch: {
                with: {
                  component: true,
                },
              },
              location: true,
            },
          },
          outputs: {
            with: {
              batch: {
                with: {
                  component: true,
                },
              },
            },
          },
        },
      });
    }),
  list: publicProcedure
    .input(listProductionJobInput.inputSchema)
    .query(async ({ input }) => {
      return await listProductionJobInput.query(input);
    }),
  create: publicProcedure
    .input(createProductionJobInput)
    .mutation(async ({ input }) => {
      return await db
        .insert(schema.base.productionJob)
        .values(input)
        .returning();
    }),
  update: publicProcedure
    .input(updateProductionJobInput)
    .mutation(async ({ input }) => {
      return await db
        .update(schema.base.productionJob)
        .set(input)
        .where(eq(schema.base.productionJob.id, input.id))
        .returning();
    }),
  complete: publicProcedure
    .input(uniqueProductionJobInput)
    .mutation(async ({ input }) => {
      return await db
        .update(schema.base.productionJob)
        .set({
          isActive: false,
        })
        .where(eq(schema.base.productionJob.id, input.id))
        .returning();
    }),
  process: publicProcedure
    .input(jobOutputInput)
    .mutation(async ({ input, ctx }) => {
      const job = await db.query.productionJob.findFirst({
        where: eq(schema.base.productionJob.id, input.id),
      });
      if (!job) {
        throw new Error("Job not found");
      }

      const subcomponents = await db.query.subcomponent.findMany({
        where: eq(schema.base.subcomponent.componentId, job.outputComponentId),
      });

      const batchInputs = await db.query.productionBatchInput.findMany({
        where: eq(schema.base.productionBatchInput.jobId, job.id),
        with: {
          batch: true,
        },
      });

      for (const subcomponent of subcomponents) {
        let quantityRequired = subcomponent.quantity.mul(input.quantity);
        const inputs = batchInputs
          .filter(
            (input) => input.batch.componentId === subcomponent.componentId,
          )
          .sort(
            (a, b) => a.batch.entryDate.getTime() - b.batch.entryDate.getTime(),
          );

        for (const input of inputs) {
          const quantityUsed = Decimal.min(
            quantityRequired,
            input.quantityAllocated.sub(input.quantityUsed),
          );

          await db
            .update(schema.base.productionBatchInput)
            .set({
              quantityUsed: input.quantityUsed.add(quantityUsed),
            })
            .where(eq(schema.base.batch.id, input.batch.id));
          await db.insert(schema.base.batchMovement).values({
            batchId: input.batch.id,
            quantity: quantityUsed.neg(),
            date: new Date(),
            locationId: job.outputLocationId,
            userId: ctx.user.id,
            type: "production",
            productionBatchInputId: input.id,
          });

          quantityRequired = quantityRequired.sub(quantityUsed);
        }

        if (quantityRequired.lte(0)) {
          break;
        }
      }

      const outputBatches = await db
        .insert(schema.base.batch)
        .values({
          componentId: job.outputComponentId,
          batchReference: job.batchNumber,
          entryDate: new Date(),
        })
        .onConflictDoNothing()
        .returning();

      const outputBatch = outputBatches[0];

      if (!outputBatch) {
        throw new Error("Failed to create output batch");
      }

      const batchOutput = await db
        .insert(schema.base.productionBatchOutput)
        .values({
          jobId: job.id,
          batchId: outputBatch.id,
          productionQuantity: input.quantity,
          productionDate: new Date(),
        })
        .returning();

      await db.insert(schema.base.batchMovement).values({
        batchId: outputBatch.id,
        quantity: input.quantity,
        date: new Date(),
        locationId: job.outputLocationId,
        userId: "",
        type: "production",
      });

      return batchOutput;
    }),
  inputs: productionJobInputRouter,
} satisfies TRPCRouterRecord;

export type ProductionRouter = typeof productionRouter;
