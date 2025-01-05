import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";

const uniqueReceiptItemInput = z.object({
  id: z.number(),
});

const receiptItemOverview = datatable(schema.base.purchaseReceiptItemOverview);

export const purchaseReceiptItemRouter = {
  get: publicProcedure
    .input(uniqueReceiptItemInput)
    .query(async ({ input }) => {
      return db.query.purchaseReceiptItemOverview.findFirst({
        where: eq(schema.base.purchaseReceiptItemOverview.id, input.id),
      });
    }),
  list: publicProcedure
    .input(receiptItemOverview.inputSchema)
    .query(async ({ input }) => {
      return await receiptItemOverview.query(input);
    }),
} satisfies TRPCRouterRecord;
