import { db } from "#db";
import { locationQuery } from "#models/location/query";
import { publicProcedure } from "#trpc";
import { z } from "zod";

import { eq, publicSchema } from "@repo/db";

import type { TRPCRouterRecord } from "@trpc/server";
import { locationGroupRouter } from "./location-group";
import { locationTypeRouter } from "./location-type";

export const uniqueLocationSchema = z.object({
  id: z.number(),
});

export const updateLocationSchema = z.object({
  id: z.number(),
  data: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    groupId: z.number().optional(),
    typeId: z.number().optional(),
  }),
});

export const createLocationSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  groupId: z.number(),
  typeId: z.number(),
});

export const locationRouter = {
  get: publicProcedure.input(uniqueLocationSchema).query(async ({ input }) => {
    return await locationQuery.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure
    .input(locationQuery.$schema)
    .query(async ({ input }) => {
      return locationQuery.findMany(input);
    }),
  update: publicProcedure
    .input(updateLocationSchema)
    .mutation(async ({ input }) => {
      return await db
        .update(publicSchema.location)
        .set(input.data)
        .where(eq(publicSchema.location.id, input.id))
        .returning();
    }),
  create: publicProcedure
    .input(createLocationSchema)
    .mutation(async ({ input }) => {
      return await db.insert(publicSchema.location).values(input).returning();
    }),
  group: locationGroupRouter,
  type: locationTypeRouter,
} satisfies TRPCRouterRecord;

export type LocationRouter = typeof locationRouter;
