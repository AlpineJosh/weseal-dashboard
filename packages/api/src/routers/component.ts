import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, asc, count, desc, eq, ilike, not, or } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import {
  handleMultiSelectFilter,
  handleNumberFilter,
  handleStringFilter,
  multiSelectFilterSchema,
  numberFilterSchema,
  paginationSchema,
  sortSchema,
  stringFilterSchema,
} from "../lib/schemas";
import { publicProcedure } from "../trpc";

export const uniqueComponentSchema = z.object({
  id: z.string(),
});

export const listComponentSchema = z.object({
  pagination: paginationSchema(),
  sort: sortSchema([
    "id",
    "description",
    "unit",
    "hasSubcomponents",
    "isTraceable",
  ]),
  filter: z
    .object({
      id: stringFilterSchema().optional(),
      description: stringFilterSchema().optional(),
      category: multiSelectFilterSchema(z.string()).optional(),
      sageDiscrepancy: numberFilterSchema().optional(),
      hasSubcomponents: z.boolean().optional(),
      search: z.string().optional(),
    })
    .optional()
    .default({}),
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
        subcomponents: {
          with: {
            subcomponentOverview: true,
          },
        },
        department: true,
        category: true,
        // batches: {
        //   with: {
        //     movements: true,
        //   },
        // },
        locations: {
          with: {
            batch: true,
            location: true,
          },
          where: not(eq(schema.batchLocationQuantity.total, 0)),
        },
      },
    });
  }),
  list: publicProcedure.input(listComponentSchema).query(async ({ input }) => {
    const where = and(
      input.filter?.id
        ? handleStringFilter(schema.componentOverview.id, input.filter.id)
        : undefined,
      input.filter?.description
        ? handleStringFilter(
            schema.componentOverview.description,
            input.filter.description,
          )
        : undefined,
      input.filter?.category
        ? handleMultiSelectFilter(
            schema.componentOverview.categoryId,
            input.filter.category,
          )
        : undefined,
      input.filter?.sageDiscrepancy
        ? handleNumberFilter(
            schema.componentOverview.sageDiscrepancy,
            input.filter.sageDiscrepancy,
          )
        : undefined,
      input.filter?.hasSubcomponents
        ? eq(
            schema.componentOverview.hasSubcomponents,
            input.filter.hasSubcomponents,
          )
        : undefined,
      input.filter?.search
        ? or(
            ilike(
              schema.componentOverview.description,
              `%${input.filter.search}%`,
            ),
            ilike(schema.componentOverview.id, `%${input.filter.search}%`),
          )
        : undefined,
    );

    const total = await db
      .select({ count: count() })
      .from(schema.componentOverview)
      .where(where);

    const results = await db.query.componentOverview.findMany({
      limit: input.pagination.size,
      offset: (input.pagination.page - 1) * input.pagination.size,
      with: {
        subcomponents: true,
        department: true,
        category: true,
      },
      where,
      orderBy: input.sort?.map((sort) =>
        sort.order === "asc"
          ? asc(
              schema.componentOverview[
                sort.field as keyof typeof schema.componentOverview
              ] as any,
            )
          : desc(
              schema.componentOverview[
                sort.field as keyof typeof schema.componentOverview
              ] as any,
            ),
      ),
    });

    return {
      rows: results,
      pagination: {
        page: input.pagination.page,
        size: input.pagination.size,
        total: total[0]?.count ?? 0,
      },
      sort: input.sort ?? [],
    };
  }),
  subcomponents: publicProcedure
    .input(z.object({ componentId: z.string() }))
    .query(async ({ input }) => {
      return await db.query.subcomponent.findMany({
        where: eq(schema.subcomponent.componentId, input.componentId),
        with: {
          subcomponentOverview: true,
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
