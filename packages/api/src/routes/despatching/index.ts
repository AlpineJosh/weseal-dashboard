import type { TRPCRouterRecord } from "@trpc/server";
import { customerRouter } from "./customer";
import { despatchRouter } from "./despatch";
import { orderRouter } from "./order";

export const despatchingRouter = {
  customer: customerRouter,
  order: orderRouter,
  despatch: despatchRouter,
} satisfies TRPCRouterRecord;

export type DespatchingRouter = typeof despatchingRouter;
