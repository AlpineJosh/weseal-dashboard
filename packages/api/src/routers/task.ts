import { createTRPCRouter, publicProcedure } from "../trpc";


export const taskRouter = createTRPCRouter({
  get: publicProcedure.query(() => {
    return "Hello World";
  }),
});