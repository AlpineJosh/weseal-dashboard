import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { publicProcedure } from "../../trpc";

const addProductionJobResourcesInput = z.array(
  z.object({
    jobId: z.number(),
    batchId: z.number(),
    quantityAllocated: z.number(),
    locationId: z.number(),
  }),
);

const processProductionJobResourcesInput = z.object({
  id: z.number(),
  quantity: z.number(),
});

export const productionJobResourcesRouter = {
  add: publicProcedure
    .input(addProductionJobResourcesInput)
    .mutation(async ({ input }) => {
      return await db
        .insert(schema.productionBatchInput)
        .values(input)
        .returning();
    }),
  process: publicProcedure
    .input(processProductionJobResourcesInput)
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const results = await tx
          .update(schema.productionBatchInput)
          .set({
            quantityUsed: input.quantity,
          })
          .where(eq(schema.productionBatchInput.id, input.id))
          .returning();

        const batchIn = results[0];

        if (!batchIn) {
          throw new Error("Batch in not found");
        }

        await tx.insert(schema.batchMovement).values({
          batchId: batchIn.batchId,
          quantity: -input.quantity,
          locationId: batchIn.locationId,
          userId: "",
          date: new Date(),
          type: "production",
        });
      });

      return;
    }),
} satisfies TRPCRouterRecord;
