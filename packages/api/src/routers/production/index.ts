import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../lib/datatable";
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
  quantity: z.number(),
});

const listProductionJobInput = datatable(schema.productionJobOverview);

export const productionRouter = {
  get: publicProcedure
    .input(uniqueProductionJobInput)
    .query(async ({ input }) => {
      return await db.query.productionJob.findFirst({
        where: eq(schema.productionJob.id, input.id),
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
  complete: publicProcedure
    .input(uniqueProductionJobInput)
    .mutation(async ({ input }) => {
      return await db
        .update(schema.productionJob)
        .set({
          isActive: false,
        })
        .where(eq(schema.productionJob.id, input.id))
        .returning();
    }),
  process: publicProcedure.input(jobOutputInput).mutation(async ({ input }) => {
    const job = await db.query.productionJob.findFirst({
      where: eq(schema.productionJob.id, input.id),
    });
    if (!job) {
      throw new Error("Job not found");
    }

    const subcomponents = await db.query.subcomponent.findMany({
      where: eq(schema.subcomponent.componentId, job.outputComponentId),
    });

    const batchInputs = await db.query.productionBatchInput.findMany({
      where: eq(schema.productionBatchInput.jobId, job.id),
      with: {
        batch: true,
      },
    });

    for (const subcomponent of subcomponents) {
      let quantityRequired = subcomponent.quantity * input.quantity;
      const inputs = batchInputs
        .filter((input) => input.batch.componentId === subcomponent.componentId)
        .sort(
          (a, b) => a.batch.entryDate.getTime() - b.batch.entryDate.getTime(),
        );

      for (const input of inputs) {
        const quantityUsed = Math.min(
          quantityRequired,
          input.quantityAllocated - input.quantityUsed,
        );

        await db
          .update(schema.productionBatchInput)
          .set({
            quantityUsed: input.quantityUsed + quantityUsed,
          })
          .where(eq(schema.batch.id, input.batch.id));
        await db.insert(schema.batchMovement).values({
          batchId: input.batch.id,
          quantity: -quantityUsed,
          date: new Date(),
          locationId: job.outputLocationId,
          userId: "",
          type: "production",
          productionBatchInputId: input.id,
        });

        quantityRequired -= quantityUsed;
      }

      if (quantityRequired <= 0) {
        break;
      }
    }

    const outputBatches = await db
      .insert(schema.batch)
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
      .insert(schema.productionBatchOutput)
      .values({
        jobId: job.id,
        batchId: outputBatch.id,
        productionQuantity: input.quantity,
        productionDate: new Date(),
      })
      .returning();

    await db.insert(schema.batchMovement).values({
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
