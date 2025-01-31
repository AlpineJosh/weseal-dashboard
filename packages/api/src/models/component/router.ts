import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, publicSchema } from "@repo/db";

import { db } from "../../db";
import { publicProcedure } from "../../trpc";
import overview from "./model";

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

  subcomponents: publicProcedure
    .input(z.object({ componentId: z.string() }))
    .query(async ({ input }) => {
      const wip = await db.query.component.findFirst({
        where: eq(publicSchema.component.id, `${input.componentId}WIP`),
      });

      const componentId = wip ? `${input.componentId}WIP` : input.componentId;

      return await db.query.subcomponent.findMany({
        where: eq(publicSchema.subcomponent.componentId, componentId),
        with: {
          subcomponent: true,
        },
      });
    }),
} satisfies TRPCRouterRecord;

export type ComponentRouter = typeof componentRouter;
