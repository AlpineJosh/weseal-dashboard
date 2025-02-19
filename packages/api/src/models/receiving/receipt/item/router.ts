import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { publicProcedure } from "../../../../trpc";
import overview from "./model";

const uniqueReceiptItemInput = z.object({
  id: z.number(),
});

export const receiptItemRouter = {
  get: publicProcedure
    .input(uniqueReceiptItemInput)
    .query(async ({ input }) => {
      return await overview.findFirst({ filter: { id: { eq: input.id } } });
    }),
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
  }),
} satisfies TRPCRouterRecord;

export type ReceiptItemRouter = typeof receiptItemRouter;
