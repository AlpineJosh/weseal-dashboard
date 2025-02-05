import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { componentRouter } from "./models/component";
import { despatchingRouter } from "./models/despatching";
import { inventoryRouter } from "./models/inventory";
import { productionRouter } from "./models/production";
import { profileRouter } from "./models/profile";
import { receivingRouter } from "./models/receiving";
import {
  createCallerFactory,
  createTRPCContext,
  createTRPCRouter,
} from "./trpc";

const appRouter = createTRPCRouter({
  component: componentRouter,
  production: productionRouter,
  despatching: despatchingRouter,
  receiving: receivingRouter,
  inventory: inventoryRouter,
  profile: profileRouter,
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
