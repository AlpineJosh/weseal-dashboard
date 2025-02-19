import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, publicSchema } from "@repo/db";

import { db } from "../../db";
import { publicProcedure } from "../../trpc";
import overview from "./model";
import { subcomponentRouter } from "./subcomponent";

export const uniqueComponentSchema = z.object({
  id: z.string(),
});

export const updateComponentSchema = z.object({
  id: z.string(),
  data: z.object({
    defaultLocationId: z.number().optional(),
    qualityCheckDetails: z.string().optional(),
    isStockTracked: z.boolean().optional(),
    isBatchTracked: z.boolean().optional(),
  }),
});

export const componentRouter = {
  get: publicProcedure.input(uniqueComponentSchema).query(async ({ input }) => {
    return await overview.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
  }),
  update: publicProcedure
    .input(updateComponentSchema)
    .mutation(async ({ input }) => {
      return await db
        .update(publicSchema.component)
        .set(input.data)
        .where(eq(publicSchema.component.id, input.id))
        .returning();
    }),

  subcomponent: subcomponentRouter,
} satisfies TRPCRouterRecord;

export type ComponentRouter = typeof componentRouter;
