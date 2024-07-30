import { createTRPCRouter, publicProcedure } from "../trpc";

export const productionRouter = createTRPCRouter({
  get: publicProcedure.query(() => {
    return "Hello World";
  }),
});
