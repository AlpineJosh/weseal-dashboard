import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter, createTRPCContext } from "@repo/api";

export const runtime = "edge";

/**
 * Configure basic CORS headers
 * You should extend this to match your needs
 */
const setCorsHeaders = (res: Response) => {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Request-Method", "*");
  res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.headers.set("Access-Control-Allow-Headers", "*");
};


export default createNextApiHandler({
  router: appRouter,
  /**
   * @link https://trpc.io/docs/v11/context
   */
  createContext: () => createTRPCContext(),
  /**
   * @link https://trpc.io/docs/v11/error-handling
   */
  onError({ error }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      // send to bug reporting
      console.error('Something went wrong', error);
    }
  },
  /**
   * @link https://trpc.io/docs/v11/caching#api-response-caching
   */
  // responseMeta() {
  //   // ...
  // },
});