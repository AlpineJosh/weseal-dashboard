import type { TRPCRouterRecord } from "@trpc/server";

import { customerRouter } from "./customer";
import { salesOrderRouter } from "./order";

export const despatchingRouter = {
  customer: customerRouter,
  order: salesOrderRouter,
} satisfies TRPCRouterRecord;

export type DespatchingRouter = typeof despatchingRouter;
