import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { publicProcedure } from "../../trpc";

const addProductionJobInput = z.array(
  z.object({
    jobId: z.number(),
    batchId: z.number(),
    quantityAllocated: z.number(),
    locationId: z.number(),
  }),
);

export const productionJobInputRouter = {
  add: publicProcedure
    .input(addProductionJobInput)
    .mutation(async ({ input }) => {
      return await db
        .insert(schema.productionBatchInput)
        .values(input)
        .returning();
    }),
} satisfies TRPCRouterRecord;
