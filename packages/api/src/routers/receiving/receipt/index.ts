import { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";
import { purchaseReceiptItemRouter } from "./item";

const uniqueReceiptInput = z.object({
  id: z.number(),
});

const receiptOverview = datatable(schema.purchaseReceiptOverview);

export const purchaseReceiptRouter = {
  get: publicProcedure.input(uniqueReceiptInput).query(async ({ input }) => {
    return db.query.purchaseReceiptOverview.findFirst({
      where: eq(schema.purchaseReceiptOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(receiptOverview.inputSchema)
    .query(async ({ input }) => {
      return await receiptOverview.query(input);
    }),
  items: purchaseReceiptItemRouter,
} satisfies TRPCRouterRecord;
