import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../db";
import { datatable } from "../../lib/datatable";
import { decimal } from "../../lib/decimal";
import { publicProcedure } from "../../trpc";

const uniqueMovementInput = z.object({
  id: z.number(),
});

const createMovementInput = z.object({
  batchId: z.number(),
  locationId: z.number(),
  quantity: decimal(),
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
  create: publicProcedure
    .input(createMovementInput)
    .mutation(async ({ input, ctx }) => {
      return await db.insert(schema.base.batchMovement).values({
        ...input,
        type: "correction",
        userId: ctx.user.id,
        date: new Date(),
      });
    }),
} satisfies TRPCRouterRecord;
