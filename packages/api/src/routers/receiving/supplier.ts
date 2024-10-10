import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { count, eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../lib/datatable";
import { publicProcedure } from "../../trpc";

const uniqueSupplierInput = z.object({
  id: z.string(),
});

const supplierOverview = datatable(schema.supplierOverview);

export const supplierRouter = {
  get: publicProcedure.input(uniqueSupplierInput).query(async ({ input }) => {
    return db.query.supplier.findFirst({
      where: eq(schema.supplier.id, input.id),
    });
  }),
  list: publicProcedure
    .input(supplierOverview.inputSchema)
    .query(async ({ input }) => {
      return await supplierOverview.query(input);
    }),
} satisfies TRPCRouterRecord;
