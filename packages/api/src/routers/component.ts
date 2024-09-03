import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, asc, desc, eq, ilike, or } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { publicProcedure } from "../trpc";

export const uniqueComponentSchema = z.object({
  id: z.string(),
});

export const listComponentSchema = z.object({
  pagination: z
    .object({
      page: z.number(),
      size: z.number(),
    })
    .optional()
    .default({
      page: 1,
      size: 10,
    }),
  sort: z
    .array(
      z.object({
        field: z.enum([
          "id",
          "description",
          "unit",
          "hasSubcomponents",
          "isTraceable",
        ]),
        order: z.enum(["asc", "desc"]),
      }),
    )
    .optional(),
  filter: z
    .object({
      search: z.string(),
      hasSubcomponents: z.boolean().optional(),
    })
    .optional(),
});

export const updateComponentSchema = z.object({
  id: z.string(),
  data: z.object({
    qualityCheckDetails: z.string(),
  }),
});

export const componentRouter = {
  get: publicProcedure.input(uniqueComponentSchema).query(async ({ input }) => {
    return await db.query.componentOverview.findFirst({
      where: eq(schema.component.id, input.id),
      with: {
        subcomponents: true,
        department: true,
        category: true,
      },
    });
  }),
  list: publicProcedure.input(listComponentSchema).query(async ({ input }) => {
    return await db.query.componentOverview.findMany({
      limit: input.pagination.size,
      offset: (input.pagination.page - 1) * input.pagination.size,
      with: {
        subcomponents: true,
        department: true,
        category: true,
      },
      where: and(
        input.filter?.hasSubcomponents
          ? eq(schema.component.hasSubcomponents, true)
          : undefined,
        input.filter?.search
          ? or(
              ilike(schema.component.description, `%${input.filter.search}%`),
              ilike(schema.component.id, input.filter.search),
            )
          : undefined,
      ),
      orderBy: input.sort?.map((sort) =>
        sort.order === "asc"
          ? asc(schema.componentOverview[sort.field])
          : desc(schema.componentOverview[sort.field]),
      ),
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
