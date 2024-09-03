import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { publicProcedure } from "../../trpc";

const uniqueSupplierInput = z.object({
  id: z.string(),
});

const listSupplierInput = z
  .object({
    pagination: z.object({
      page: z.number(),
      size: z.number(),
    }),
  })
  .optional()
  .default({
    pagination: {
      page: 1,
      size: 10,
    },
  });

export const supplierRouter = {
  list: publicProcedure.input(listSupplierInput).query(async ({ input }) => {
    return db.query.supplier.findMany({
      limit: input.pagination.size,
      offset: (input.pagination.page - 1) * input.pagination.size,
    });
  }),
  get: publicProcedure.input(uniqueSupplierInput).query(async ({ input }) => {
    return db.query.supplier.findFirst({
      where: eq(schema.supplier.id, input.id),
    });
  }),
} satisfies TRPCRouterRecord;
