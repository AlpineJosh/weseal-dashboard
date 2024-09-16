import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { count, eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { publicProcedure } from "../../trpc";

const uniqueSupplierInput = z.object({
  id: z.string(),
});

const listSupplierInput = z.object({
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
});

export const supplierRouter = {
  list: publicProcedure.input(listSupplierInput).query(async ({ input }) => {
    const total = await db.select({ count: count() }).from(schema.supplier);

    const results = await db.query.supplier.findMany({
      limit: input.pagination.size,
      offset: (input.pagination.page - 1) * input.pagination.size,
    });

    return {
      pagination: {
        page: input.pagination.page,
        size: input.pagination.size,
        total: total[0]?.count ?? 0,
      },
      sort: [],
      rows: results,
    };
  }),
  get: publicProcedure.input(uniqueSupplierInput).query(async ({ input }) => {
    return db.query.supplier.findFirst({
      where: eq(schema.supplier.id, input.id),
    });
  }),
} satisfies TRPCRouterRecord;
