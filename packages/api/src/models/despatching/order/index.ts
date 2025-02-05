import type { TRPCRouterRecord } from "@trpc/server";

import { orderItemRouter } from "./item/router";
import { salesOrderRouter } from "./router";

export const orderRouter = {
  ...salesOrderRouter,
  item: orderItemRouter,
} satisfies TRPCRouterRecord;

export type OrderRouter = typeof orderRouter;
