// import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import type { AnyColumn } from "@repo/db";
import { asc, count, desc, eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema, { componentSelectSchema } from "@repo/db/schema";

import { createTRPCRouter, publicProcedure } from "../trpc";

const uniqueComponentSchema = z.object({
  id: z.string(),
});

const listComponentSchema = z.object({
  pagination: z.object({
    page: z.number().optional().default(1),
    size: z.number().optional().default(10),
  }),
  sort: z
    .array(
      z.object({
        field: z.string(),
        order: z.enum(["asc", "desc"]),
      }),
    )
    .optional(),
  columns: z.object(
    Object.values(schema.component._.columns).reduce(
      (acc, column) => {
        const sortSchema = z.enum(["asc", "desc"]).optional();
        let filterSchema: z.ZodTypeAny;
        switch (column.columnType) {
          case "PgTimestamp":
            filterSchema = z.object({
              after: z.date().optional(),
              before: z.date().optional(),
            });
            break;
          case "PgReal":
            filterSchema = z.object({
              min: z.number().optional(),
              max: z.number().optional(),
            });
            break;
          default:
            filterSchema = z.string();
        }
        acc[column.name] = z.object({
          sort: sortSchema,
          filter: filterSchema.optional(),
        });
        return acc;
      },
      {} as Record<string, z.ZodTypeAny>,
    ),
  ),
});

export const componentRouter = createTRPCRouter({
  // all: publicProcedure.input(componentQuerySchema).query(async ({ input }) => {
  //   let query = db.select().from(componentOverview).$dynamic();

  //   query = query
  //     .orderBy(
  //       ...input.sort.map((sort) => {
  //         const column = componentOverview[sort.field];
  //         return sort.order === "asc" ? asc(column) : desc(column);
  //       }),
  //     )
  //     .$dynamic();

  //   const total = await db
  //     .select({ total: count().as("total") })
  //     .from(query.as("t"));
  //   const page = await query
  //     .limit(input.pagination.size)
  //     .offset((input.pagination.page - 1) * input.pagination.size);

  //   return {
  //     data: page,
  //     pagination: {
  //       page: input.pagination.page,
  //       size: input.pagination.size,
  //       total: total[0]?.total ?? 0,
  //     },
  //     filter: input.filter,
  //     sort: input.sort,
  //     search: input.search,
  //   };
  // }),
  get: publicProcedure.input(uniqueComponentSchema).query(async ({ input }) => {
    return await db.query.component.findFirst({
      where: eq(schema.component.id, input.id),
      with: {
        subcomponents: true,
        department: true,
        category: true,
      },
    });
  }),
  list: publicProcedure.input(listComponentSchema).query(async ({ input }) => {
    const query = db.query.component.findMany({
      limit: input.pagination.size,
      offset: (input.pagination.page - 1) * input.pagination.size,
      columns: input.columns.reduce(
        (acc, column) => {
          acc[column.name] = true;
          return acc;
        },
        {} as Record<string, true>,
      ),
      with: {
        subcomponents: true,
        department: true,
        category: true,
      },
      orderBy: (input.columns ?? []).map((col) => {
        const column = schema.component.id as AnyColumn;
        return col.sort === "asc" ? asc(column) : desc(column);
      }),
    });
  }),
});
