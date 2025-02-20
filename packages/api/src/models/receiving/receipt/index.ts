import type { TRPCRouterRecord } from "@trpc/server";

import { receiptItemRouter } from "./item/router";
import { purchaseReceiptRouter } from "./router";

export const receiptRouter = {
  ...purchaseReceiptRouter,
  item: receiptItemRouter,
} satisfies TRPCRouterRecord;

export type ReceiptRouter = typeof receiptRouter;
