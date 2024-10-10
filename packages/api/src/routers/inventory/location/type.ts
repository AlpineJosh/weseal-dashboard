import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { count, eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

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

const locationTypeOverview = datatable(schema.locationType);

export const locationTypeRouter = {
  get: publicProcedure
    .input(uniqueLocationTypeInput)
    .query(async ({ input }) => {
      return await db.query.locationType.findFirst({
        where: eq(schema.locationType.id, input.id),
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
        .insert(schema.locationType)
        .values({
          ...input,
        })
        .returning();
    }),

  update: publicProcedure
    .input(updateLocationTypeInput)
    .mutation(async ({ input: { id, ...input } }) => {
      return await db
        .update(schema.locationType)
        .set({
          ...input,
        })
        .where(eq(schema.locationType.id, id))
        .returning();
    }),
  delete: publicProcedure
    .input(uniqueLocationTypeInput)
    .mutation(async ({ input }) => {
      return await db
        .delete(schema.locationType)
        .where(eq(schema.locationType.id, input.id))
        .returning();
    }),
} satisfies TRPCRouterRecord;
