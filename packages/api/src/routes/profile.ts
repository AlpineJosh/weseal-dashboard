import { db } from "#db";
import { profileQuery } from "#models/profile/query";
import { publicProcedure } from "#trpc";
import { z } from "zod";

import { eq, publicSchema } from "@repo/db";

import type { TRPCRouterRecord } from "@trpc/server";

export const uniqueProfileSchema = z.object({
  id: z.string(),
});

export const updateProfileSchema = z.object({
  id: z.string(),
  data: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
  }),
});

export const profileRouter = {
  get: publicProcedure.input(uniqueProfileSchema).query(async ({ input }) => {
    return await profileQuery.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure.input(profileQuery.$schema).query(async ({ input }) => {
    return profileQuery.findMany(input);
  }),
  update: publicProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input }) => {
      return await db
        .update(publicSchema.profile)
        .set(input.data)
        .where(eq(publicSchema.profile.id, input.id))
        .returning();
    }),
} satisfies TRPCRouterRecord;

export type ProfileRouter = typeof profileRouter;
