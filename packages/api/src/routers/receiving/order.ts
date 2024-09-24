import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { count, eq, ilike, sql } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { paginationSchema } from "../../lib/schemas";
import { publicProcedure } from "../../trpc";

const uniqueOrderInput = z.object({
  id: z.number(),
});

const listOrderInput = z.object({
  pagination: paginationSchema(),
  filter: z.object({
    search: z.string().optional(),
  }),
});

export const purchaseOrderRouter = {
  list: publicProcedure.input(listOrderInput).query(async ({ input }) => {
    const where = input.filter.search
      ? sql`${schema.purchaseOrder.id}::text ILIKE ${"%" + input.filter.search + "%"}`
      : undefined;

    const total = await db
      .select({ count: count() })
      .from(schema.purchaseOrder)
      .where(where);

    const results = await db.query.purchaseOrder.findMany({
      limit: input.pagination.size,
      offset: (input.pagination.page - 1) * input.pagination.size,
      where,
      with: {
        supplier: true,
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
    return db.query.purchaseOrder.findFirst({
      where: eq(schema.purchaseOrder.id, input.id),
      with: {
        supplier: true,
        items: {
          with: {
            component: true,
          },
        },
      },
    });
  }),
} satisfies TRPCRouterRecord;
