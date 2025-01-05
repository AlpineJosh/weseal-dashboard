import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../db";
import { datatable } from "../../lib/datatable";
import { publicProcedure } from "../../trpc";

const uniqueSupplierInput = z.object({
  id: z.string(),
});

const supplierOverview = datatable(schema.base.supplierOverview);

export const supplierRouter = {
  get: publicProcedure.input(uniqueSupplierInput).query(async ({ input }) => {
    return db.query.supplier.findFirst({
      where: eq(schema.base.supplier.id, input.id),
    });
  }),
  list: publicProcedure
    .input(supplierOverview.inputSchema)
    .query(async ({ input }) => {
      return await supplierOverview.query(input);
    }),
} satisfies TRPCRouterRecord;
