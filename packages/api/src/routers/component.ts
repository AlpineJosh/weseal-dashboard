import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../lib/datatable";
import { publicProcedure } from "../trpc";

export const uniqueComponentSchema = z.object({
  id: z.string(),
});

export const componentOverview = datatable(schema.componentOverview);

export const updateComponentSchema = z.object({
  id: z.string(),
  data: z.object({
    qualityCheckDetails: z.string(),
  }),
});

export const componentRouter = {
  get: publicProcedure.input(uniqueComponentSchema).query(async ({ input }) => {
    return await db.query.componentOverview.findFirst({
      where: eq(schema.componentOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(componentOverview.inputSchema)
    .query(async ({ input }) => {
      try {
        componentOverview.inputSchema.safeParse(input);
      } catch (error) {
        console.log(error);
      }
      return componentOverview.query(input);
    }),
  subcomponents: publicProcedure
    .input(z.object({ componentId: z.string() }))
    .query(async ({ input }) => {
      return await db.query.subcomponent.findMany({
        where: eq(schema.subcomponent.componentId, input.componentId),
        with: {
          subcomponent: true,
        },
      });
    }),
  update: publicProcedure
    .input(updateComponentSchema)
    .mutation(async ({ input }) => {
      return await db
        .update(schema.component)
        .set(input.data)
        .where(eq(schema.component.id, input.id))
        .returning();
    }),
} satisfies TRPCRouterRecord;

export type ComponentRouter = typeof componentRouter;
