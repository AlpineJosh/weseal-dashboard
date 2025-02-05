import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, publicSchema } from "@repo/db";

import { db } from "../../db";
import { publicProcedure } from "../../trpc";
import overview from "./model";

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
    return await overview.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
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
