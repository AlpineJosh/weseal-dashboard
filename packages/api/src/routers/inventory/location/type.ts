import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";

const uniqueLocationTypeInput = z.object({
  id: z.number(),
});

const createLocationTypeInput = z.object({
  name: z.string(),
  isTransient: z.boolean(),
  isPickable: z.boolean(),
});

const updateLocationTypeInput = uniqueLocationTypeInput.merge(
  createLocationTypeInput,
);

const locationTypeOverview = datatable(schema.base.locationType);

export const locationTypeRouter = {
  get: publicProcedure
    .input(uniqueLocationTypeInput)
    .query(async ({ input }) => {
      return await db.query.locationType.findFirst({
        where: eq(schema.base.locationType.id, input.id),
        with: {
          parentGroup: true,
          locations: true,
        },
      });
    }),
  list: publicProcedure
    .input(locationTypeOverview.inputSchema)
    .query(async ({ input }) => {
      return await locationTypeOverview.query(input);
    }),
  create: publicProcedure
    .input(createLocationTypeInput)
    .mutation(async ({ input }) => {
      return await db
        .insert(schema.base.locationType)
        .values({
          ...input,
        })
        .returning();
    }),

  update: publicProcedure
    .input(updateLocationTypeInput)
    .mutation(async ({ input: { id, ...input } }) => {
      return await db
        .update(schema.base.locationType)
        .set({
          ...input,
        })
        .where(eq(schema.base.locationType.id, id))
        .returning();
    }),
  delete: publicProcedure
    .input(uniqueLocationTypeInput)
    .mutation(async ({ input }) => {
      return await db
        .delete(schema.base.locationType)
        .where(eq(schema.base.locationType.id, input.id))
        .returning();
    }),
} satisfies TRPCRouterRecord;
