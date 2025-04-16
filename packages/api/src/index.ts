import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { batchRouter } from "./routes/batch";
import { componentRouter } from "./routes/component";
import { despatchingRouter } from "./routes/despatching";
import { inventoryRouter } from "./routes/inventory";
import { locationRouter } from "./routes/location";
import { productionRouter } from "./routes/production";
import { profileRouter } from "./routes/profile";
import { receivingRouter } from "./routes/receiving";
import { taskRouter } from "./routes/task";
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
  task: taskRouter,
  batch: batchRouter,
  location: locationRouter,
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
