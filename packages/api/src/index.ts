import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { componentRouter } from "./routers/component";
import { despatchingRouter } from "./routers/despatching";
import { inventoryRouter } from "./routers/inventory";
import { resetInventory } from "./routers/inventory/reset";
import { productionRouter } from "./routers/production";
import { receivingRouter } from "./routers/receiving";
import { taskRouter } from "./routers/task";
import {
  createCallerFactory,
  createTRPCContext,
  createTRPCRouter,
  publicProcedure,
} from "./trpc";

const appRouter = createTRPCRouter({
  component: componentRouter,
  production: productionRouter,
  despatching: despatchingRouter,
  receiving: receivingRouter,
  inventory: inventoryRouter,
  task: taskRouter,
  resetInventory: publicProcedure.mutation(async () => {
    await resetInventory();
    return { success: true };
  }),
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
