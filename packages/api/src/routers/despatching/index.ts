import { createTRPCRouter } from "../../trpc";
import { customerRouter } from "./customer";
import { salesOrderRouter } from "./order";

export const despatchingRouter = createTRPCRouter({
  customer: customerRouter,
  order: salesOrderRouter,
});

export type DespatchingRouter = typeof despatchingRouter;
