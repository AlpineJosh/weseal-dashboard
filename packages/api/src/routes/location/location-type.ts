import { z } from "zod";

import { eq, publicSchema } from "@repo/db";

import { db } from "../../db";
import { publicProcedure } from "../../trpc";

export const createLocationTypeSchema = z.object({
  name: z.string(),
  isPickable: z.boolean().default(true),
  isTransient: z.boolean().default(false),
});

export const updateLocationTypeSchema = z.object({
  id: z.number(),
  data: z.object({
    name: z.string(),
    isPickable: z.boolean().optional(),
    isTransient: z.boolean().optional(),
  }),
});

export const deleteLocationTypeSchema = z.object({
  id: z.number(),
});

export const locationTypeRouter = {
  create: publicProcedure
    .input(createLocationTypeSchema)
    .mutation(async ({ input }) => {
      return await db
        .insert(publicSchema.locationType)
        .values(input)
        .returning();
    }),
  update: publicProcedure
    .input(updateLocationTypeSchema)
    .mutation(async ({ input }) => {
      return await db
        .update(publicSchema.locationType)
        .set(input.data)
        .where(eq(publicSchema.locationType.id, input.id))
        .returning();
    }),
  delete: publicProcedure
    .input(deleteLocationTypeSchema)
    .mutation(async ({ input }) => {
      return await db
        .delete(publicSchema.locationType)
        .where(eq(publicSchema.locationType.id, input.id));
    }),
};
