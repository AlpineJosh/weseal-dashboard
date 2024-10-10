import { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../lib/datatable";
import { publicProcedure } from "../../trpc";

const uniqueMovementInput = z.object({
  id: z.number(),
});

const movementOverview = datatable(schema.batchMovementOverview);

export const movementsRouter = {
  get: publicProcedure.input(uniqueMovementInput).query(async ({ input }) => {
    return await db.query.batchMovementOverview.findFirst({
      where: eq(schema.batchMovementOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(movementOverview.inputSchema)
    .query(async ({ input }) => {
      return await movementOverview.query(input);
    }),
} satisfies TRPCRouterRecord;
