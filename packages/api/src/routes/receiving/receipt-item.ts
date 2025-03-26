import { receiptItemQuery } from "#models/receiving/query";
import { publicProcedure } from "#trpc";
import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";

const uniqueReceiptItemInput = z.object({
  id: z.number(),
});

export const receiptItemRouter = {
  get: publicProcedure
    .input(uniqueReceiptItemInput)
    .query(async ({ input }) => {
      return await receiptItemQuery.findFirst({
        filter: { id: { eq: input.id } },
      });
    }),
  list: publicProcedure
    .input(receiptItemQuery.$schema)
    .query(async ({ input }) => {
      return receiptItemQuery.findMany(input);
    }),
} satisfies TRPCRouterRecord;

export type ReceiptItemRouter = typeof receiptItemRouter;
