import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { componentRouter } from "./routers/component";
import { salesAccountRouter } from "./routers/customer";
import { purchaseOrderRouter } from "./routers/purchase-order";
import { salesOrderRouter } from "./routers/sales-order";
import { purchaseAccountRouter } from "./routers/supplier";
import { taskRouter } from "./routers/task";
import {
  createCallerFactory,
  createTRPCContext,
  createTRPCRouter,
} from "./trpc";

const appRouter = createTRPCRouter({
  component: componentRouter,
  purchaseOrder: purchaseOrderRouter,
  salesOrder: salesOrderRouter,
  salesAccount: salesAccountRouter,
  purchaseAccount: purchaseAccountRouter,
  task: taskRouter,
});

type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
const createCaller = createCallerFactory(appRouter);

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
type RouterOutputs = inferRouterOutputs<AppRouter>;

export { createTRPCContext, appRouter, createCaller };
export type { AppRouter, RouterInputs, RouterOutputs };
