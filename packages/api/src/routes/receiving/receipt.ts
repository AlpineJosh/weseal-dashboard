import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";
import { db } from "@/db";
import { decimal } from "@/lib/decimal";
import { receiptQuery } from "@/models/receiving/query";
import { processReceipt } from "@/models/receiving/receipt";
import { publicProcedure } from "@/trpc";

export const uniqueReceiptSchema = z.object({
  id: z.number(),
});

const receiveReceiptInput = z.object({
  orderId: z.number(),
  items: z.array(
    z.object({
      reference: z.object({
        componentId: z.string(),
        batchId: z.number().nullable(),
      }),
      quantity: decimal(),
    }),
  ),
  locationId: z.number(),
});

export const receiptRouter = {
  get: publicProcedure.input(uniqueReceiptSchema).query(async ({ input }) => {
    return await receiptQuery.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure.input(receiptQuery.$schema).query(async ({ input }) => {
    return receiptQuery.findMany(input);
  }),
  receive: publicProcedure
    .input(receiveReceiptInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        await processReceipt(tx, {
          ...input,
          userId: ctx.user.id,
        });
      });
    }),
} satisfies TRPCRouterRecord;

export type ReceiptRouter = typeof receiptRouter;
