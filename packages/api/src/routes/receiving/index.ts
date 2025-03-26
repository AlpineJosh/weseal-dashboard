import type { TRPCRouterRecord } from "@trpc/server";

import { orderRouter } from "./order";
import { receiptRouter } from "./receipt";
import { supplierRouter } from "./supplier";

export const receivingRouter = {
  supplier: supplierRouter,
  order: orderRouter,
  receipt: receiptRouter,
} satisfies TRPCRouterRecord;

export type ReceivingRouter = typeof receivingRouter;
