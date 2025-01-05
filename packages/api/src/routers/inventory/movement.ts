import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../db";
import { datatable } from "../../lib/datatable";
import { publicProcedure } from "../../trpc";

const uniqueMovementInput = z.object({
  id: z.number(),
});

const movementOverview = datatable(schema.base.batchMovementOverview);

export const movementsRouter = {
  get: publicProcedure.input(uniqueMovementInput).query(async ({ input }) => {
    return await db.query.batchMovementOverview.findFirst({
      where: eq(schema.base.batchMovementOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(movementOverview.inputSchema)
    .query(async ({ input }) => {
      return await movementOverview.query(input);
    }),
} satisfies TRPCRouterRecord;
