import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { count, eq, sql } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import {
  paginationSchema,
  sortSchema,
  stringFilterSchema,
} from "../../lib/schemas";
import { publicProcedure } from "../../trpc";

const despatchCTE = db
  .select({
    total: count(),
  })
  .from(schema.salesDespatch)
  .groupBy(schema.salesDespatch.orderId)
  .as("despatch_cte");

const uniqueOrderInput = z.object({
  id: z.number(),
});

const listOrderInput = z.object({
  pagination: paginationSchema(),
  filter: z.object({
    search: z.string().optional(),
  }),
});

export const salesOrderRouter = {
  list: publicProcedure.input(listOrderInput).query(async ({ input }) => {
    const where = input.filter.search
      ? sql`${schema.salesOrder.id}::text ILIKE ${"%" + input.filter.search + "%"}`
      : undefined;

    const total = await db
      .select({ count: count() })
      .from(schema.salesOrder)
      .where(where);

    const results = await db.query.salesOrder.findMany({
      limit: input.pagination.size,
      offset: (input.pagination.page - 1) * input.pagination.size,
      where,
      with: {
        customer: true,
      },
    });

    return {
      rows: results,
      pagination: {
        page: input.pagination.page,
        size: input.pagination.size,
        total: total[0]?.count ?? 0,
      },
    };
  }),
  get: publicProcedure.input(uniqueOrderInput).query(async ({ input }) => {
    return db.query.salesOrder.findFirst({
      where: eq(schema.salesOrder.id, input.id),
      with: {
        customer: true,
        items: {
          with: {
            component: true,
          },
        },
      },
    });
  }),
} satisfies TRPCRouterRecord;
