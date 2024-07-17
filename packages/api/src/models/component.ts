import { z } from "zod";

import { asc, count, desc, eq } from "@repo/db";
import { db } from "@repo/db/client";
import { stockCategory, stockComponent } from "@repo/db/schema/sage";
import { stockMeta } from "@repo/db/schema/stock";

import { createTRPCRouter, publicProcedure } from "../trpc";

const componentQuerySchema = z.object({
  search: z.string().max(256).optional(),
  sort: z
    .array(
      z.object({
        field: z.enum(["id", "description"]),
        order: z.enum(["asc", "desc"]).default("asc"),
      }),
    )
    .default([
      {
        field: "id",
        order: "asc",
      },
    ]),
  filter: z
    .object({
      categories: z.array(z.string()).optional(),
    })
    .optional(),
  pagination: z
    .object({
      size: z.number().min(1).max(100),
      page: z.number(),
    })
    .default({
      size: 10,
      page: 1,
    }),
});

export const componentRouter = createTRPCRouter({
  all: publicProcedure.input(componentQuerySchema).query(async ({ input }) => {
    let query = db
      .select({
        id: stockComponent.id,
        description: stockComponent.description,
        category: stockCategory.name,
      })
      .from(stockComponent)
      .leftJoin(stockMeta, eq(stockComponent.id, stockMeta.componentId))
      .$dynamic()
      .leftJoin(
        stockCategory,
        eq(stockComponent.stockCategoryId, stockCategory.id),
      )
      .$dynamic();

    query = query
      .orderBy(
        ...input.sort.map((sort) => {
          const column = stockComponent[sort.field];
          return sort.order === "asc" ? asc(column) : desc(column);
        }),
      )
      .$dynamic();

    const total = await db.select({ total: count() }).from(query.as("t"));
    const page = await query
      .limit(input.pagination.size)
      .offset((input.pagination.page - 1) * input.pagination.size);

    return {
      data: page,
      pagination: {
        page: input.pagination.page,
        size: input.pagination.size,
        total: total[0]?.total ?? 0,
      },
      filter: input.filter,
      sort: input.sort,
      search: input.search,
    };
  }),
});
