import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";
import { purchaseReceiptItemRouter } from "./item";

const uniqueReceiptInput = z.object({
  id: z.number(),
});

const receiptOverview = datatable(schema.base.purchaseReceiptOverview);

export const purchaseReceiptRouter = {
  get: publicProcedure.input(uniqueReceiptInput).query(async ({ input }) => {
    return db.query.purchaseReceiptOverview.findFirst({
      where: eq(schema.base.purchaseReceiptOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(receiptOverview.inputSchema)
    .query(async ({ input }) => {
      return await receiptOverview.query(input);
    }),
  items: purchaseReceiptItemRouter,
} satisfies TRPCRouterRecord;
