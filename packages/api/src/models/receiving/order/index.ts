import type { TRPCRouterRecord } from "@trpc/server";

import { orderItemRouter } from "./item/router";
import { purchaseOrderRouter } from "./router";

export const orderRouter = {
  ...purchaseOrderRouter,
  item: orderItemRouter,
} satisfies TRPCRouterRecord;

export type OrderRouter = typeof orderRouter;
