import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, count, eq, sum } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import {
  handlePagination,
  handleSort,
  handleStringFilter,
  paginationSchema,
  sortSchema,
  stringFilterSchema,
} from "../../lib/schemas";
import { publicProcedure } from "../../trpc";

const uniqueCustomerInput = z.object({
  id: z.string(),
});

const listCustomerInput = z.object({
  pagination: paginationSchema(),
  filter: z.object({
    id: stringFilterSchema().optional(),
    name: stringFilterSchema().optional(),
  }),
  sort: sortSchema(["id", "name"]),
});

export const customerRouter = {
  list: publicProcedure.input(listCustomerInput).query(async ({ input }) => {
    const where = and(
      input.filter.id
        ? handleStringFilter(schema.customer.id, input.filter.id)
        : undefined,
      input.filter.name
        ? handleStringFilter(schema.customer.name, input.filter.name)
        : undefined,
    );

    const total = await db
      .select({ count: count() })
      .from(schema.customer)
      .where(where);

    const results = await db.query.customer.findMany({
      ...handlePagination(input.pagination),
      orderBy: handleSort(schema.customer as any, input.sort),
      where,
    });

    return {
      pagination: {
        ...input.pagination,
        total: total[0]?.count ?? 0,
      },
      sort: input.sort,
      rows: results,
    };
  }),
  get: publicProcedure.input(uniqueCustomerInput).query(async ({ input }) => {
    return db.query.customer.findFirst({
      where: eq(schema.customer.id, input.id),
    });
  }),
} satisfies TRPCRouterRecord;
