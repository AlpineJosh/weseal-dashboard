import { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";

const uniqueReceiptItemInput = z.object({
  id: z.number(),
});

const receiptItemOverview = datatable(schema.purchaseReceiptItemOverview);

export const purchaseReceiptItemRouter = {
  get: publicProcedure
    .input(uniqueReceiptItemInput)
    .query(async ({ input }) => {
      return db.query.purchaseReceiptItemOverview.findFirst({
        where: eq(schema.purchaseReceiptItemOverview.id, input.id),
      });
    }),
  list: publicProcedure
    .input(receiptItemOverview.inputSchema)
    .query(async ({ input }) => {
      return await receiptItemOverview.query(input);
    }),
} satisfies TRPCRouterRecord;
