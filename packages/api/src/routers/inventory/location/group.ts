import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { count, eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";

const uniqueLocationGroupInput = z.object({
  id: z.number(),
});

const createLocationGroupInput = z.object({
  name: z.string(),
  parentGroupId: z.number().optional(),
});

const updateLocationGroupInput = uniqueLocationGroupInput.merge(
  createLocationGroupInput,
);

const locationGroupOverview = datatable(schema.locationGroup);

export const locationGroupRouter = {
  get: publicProcedure
    .input(uniqueLocationGroupInput)
    .query(async ({ input }) => {
      return await db.query.locationGroup.findFirst({
        where: eq(schema.locationGroup.id, input.id),
        with: {
          parentGroup: true,
          locations: true,
        },
      });
    }),
  list: publicProcedure
    .input(locationGroupOverview.inputSchema)
    .query(async ({ input }) => {
      return await locationGroupOverview.query(input);
    }),
  create: publicProcedure
    .input(createLocationGroupInput)
    .mutation(async ({ input }) => {
      return await db
        .insert(schema.locationGroup)
        .values({
          ...input,
        })
        .returning();
    }),
  update: publicProcedure
    .input(updateLocationGroupInput)
    .mutation(async ({ input: { id, ...input } }) => {
      return await db
        .update(schema.locationGroup)
        .set({
          ...input,
        })
        .where(eq(schema.locationGroup.id, id))
        .returning();
    }),
  delete: publicProcedure
    .input(uniqueLocationGroupInput)
    .mutation(async ({ input }) => {
      return await db
        .delete(schema.locationGroup)
        .where(eq(schema.locationGroup.id, input.id))
        .returning();
    }),
} satisfies TRPCRouterRecord;
