// import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { asc, count, desc, eq } from "@repo/db";
import { db } from "@repo/db/client";

import { componentOverview } from "../models/component";
// import {
//   filterSchema,
//   paginationSchema,
//   searchSchema,
//   sortSchema,
// } from "../lib.ts/schemas/query";
import { createTRPCRouter, publicProcedure } from "../trpc";


const componentQuerySchema = z.object({
  search: z.string().max(256).optional(),
  sort: z
    .array(
      z.object({
        field: z.enum(["id", "quantity"]),
        order: z.enum(["asc", "desc"]).default("asc"),
      }),
    )
    .default([
      {
        field: "quantity",
        order: "desc",
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

type _test = typeof componentOverview._.selectedFields.id



export const componentRouter = createTRPCRouter({
  all: publicProcedure.input(componentQuerySchema).query(async ({ input }) => {
    let query = db.select().from(componentOverview).$dynamic();

    query = query
      .orderBy(
        ...input.sort.map((sort) => {
          const column = componentOverview[sort.field];
          return sort.order === "asc" ? asc(column) : desc(column);
        }),
      )
      .$dynamic();

    const total = await db
      .select({ total: count().as("total") })
      .from(query.as("t"));
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
  get: publicProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ input }) => {
    return await db.select().from(componentOverview).where(eq(componentOverview.id, input.id)).then(result => result[0]);
  }),
});
