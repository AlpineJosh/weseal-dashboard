import { createTRPCRouter } from "../../trpc";
import { purchaseOrderRouter } from "./order";
import { supplierRouter } from "./supplier";

export const receivingRouter = createTRPCRouter({
  supplier: supplierRouter,
  order: purchaseOrderRouter,
});

export type ReceivingRouter = typeof receivingRouter;
