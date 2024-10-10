import type { TRPCRouterRecord } from "@trpc/server";

import { purchaseOrderRouter } from "./order";
import { purchaseReceiptRouter } from "./receipt";
import { supplierRouter } from "./supplier";

export const receivingRouter = {
  suppliers: supplierRouter,
  orders: purchaseOrderRouter,
  receipts: purchaseReceiptRouter,
} satisfies TRPCRouterRecord;

export type ReceivingRouter = typeof receivingRouter;
