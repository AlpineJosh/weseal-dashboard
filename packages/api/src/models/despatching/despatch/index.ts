import type { TRPCRouterRecord } from "@trpc/server";

import { despatchItemRouter } from "./item/router";
import { salesDespatchRouter } from "./router";

export const despatchRouter = {
  ...salesDespatchRouter,
  item: despatchItemRouter,
} satisfies TRPCRouterRecord;

export type DespatchRouter = typeof despatchRouter;
