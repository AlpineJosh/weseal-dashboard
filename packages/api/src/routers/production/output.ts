import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq, sql } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { publicProcedure } from "../../trpc";

const productionJobOutputSchema = z.object({
  jobId: z.number(),
  quantity: z.number(),
  locationId: z.number(),
});

export const productionJobOutputRouter = {
  create: publicProcedure
    .input(productionJobOutputSchema)
    .mutation(async ({ input }) => {
      const job = await db.query.productionJob.findFirst({
        where: eq(schema.productionJob.id, input.jobId),
      });

      if (!job) {
        throw new Error("Job not found");
      }

      let batch = await db.query.batch.findFirst({
        where: and(
          eq(schema.batch.batchReference, job.batchNumber ?? ""),
          eq(schema.batch.componentId, job.componentId),
          sql<boolean>`${schema.batch.entryDate}::date = CURRENT_DATE`,
        ),
      });

      if (!batch) {
        const results = await db
          .insert(schema.batch)
          .values({
            batchReference: job.batchNumber ?? "",
            componentId: job.componentId,
            entryDate: new Date(),
          })
          .returning();

        if (!results[0]) {
          throw new Error("Batch not found");
        }

        batch = results[0];
      }

      await db.insert(schema.batchMovement).values({
        batchId: batch.id,
        quantity: input.quantity,
        locationId: input.locationId,
        userId: "",
        date: new Date(),
        type: "production",
      });

      return;
    }),
} satisfies TRPCRouterRecord;
