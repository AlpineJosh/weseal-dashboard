import type { TRPCRouterRecord } from "@trpc/server";
import { productionJobRouter } from "./job";

export const productionRouter = {
  jobs: productionJobRouter,
} satisfies TRPCRouterRecord;

export type ProductionRouter = typeof productionRouter;
