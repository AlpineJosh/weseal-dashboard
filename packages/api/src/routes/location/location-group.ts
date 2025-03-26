import { db } from "#db";
import { locationGroupQuery } from "#models/location/query";
import { publicProcedure } from "#trpc";
import { z } from "zod";

import { eq, publicSchema } from "@repo/db";

import type { TRPCRouterRecord } from "@trpc/server";

export const uniqueLocationGroupSchema = z.object({
  id: z.number(),
});

export const createLocationGroupSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  groupId: z.number().optional(),
});

export const updateLocationGroupSchema = z.object({
  id: z.number(),
  data: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    groupId: z.number().optional(),
  }),
});

export const locationGroupRouter = {
  get: publicProcedure
    .input(uniqueLocationGroupSchema)
    .query(async ({ input }) => {
      return await locationGroupQuery.findFirst({
        filter: { id: { eq: input.id } },
      });
    }),
  list: publicProcedure
    .input(locationGroupQuery.$schema)
    .query(async ({ input }) => {
      return locationGroupQuery.findMany(input);
    }),
  update: publicProcedure
    .input(updateLocationGroupSchema)
    .mutation(async ({ input }) => {
      return await db
        .update(publicSchema.locationGroup)
        .set(input.data)
        .where(eq(publicSchema.locationGroup.id, input.id))
        .returning();
    }),
  create: publicProcedure
    .input(createLocationGroupSchema)
    .mutation(async ({ input }) => {
      return await db
        .insert(publicSchema.locationGroup)
        .values(input)
        .returning();
    }),
} satisfies TRPCRouterRecord;

export type LocationGroupRouter = typeof locationGroupRouter;
