import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { publicProcedure } from "../../../trpc";
import overview from "./model";

export const uniqueCustomerSchema = z.object({
  id: z.string(),
});

export const customerRouter = {
  get: publicProcedure.input(uniqueCustomerSchema).query(async ({ input }) => {
    return await overview.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
  }),
} satisfies TRPCRouterRecord;

export type CustomerRouter = typeof customerRouter;
