import type { TRPCRouterRecord } from "@trpc/server";

import { customerRouter } from "./customer";
import { salesDespatchRouter } from "./despatch";
import { salesOrderRouter } from "./order";

export const despatchingRouter = {
  customer: customerRouter,
  order: salesOrderRouter,
  despatch: salesDespatchRouter,
} satisfies TRPCRouterRecord;

export type DespatchingRouter = typeof despatchingRouter;
