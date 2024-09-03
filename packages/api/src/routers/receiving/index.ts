import type { TRPCRouterRecord } from "@trpc/server";

import { purchaseOrderRouter } from "./order";
import { supplierRouter } from "./supplier";

export const receivingRouter = {
  supplier: supplierRouter,
  order: purchaseOrderRouter,
} satisfies TRPCRouterRecord;

export type ReceivingRouter = typeof receivingRouter;
