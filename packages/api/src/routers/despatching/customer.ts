import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../db";
import { datatable } from "../../lib/datatable";
import { publicProcedure } from "../../trpc";

const uniqueCustomerInput = z.object({
  id: z.string(),
});

const customerOverview = datatable(schema.base.customer);

export const customerRouter = {
  list: publicProcedure
    .input(customerOverview.inputSchema)
    .query(async ({ input }) => {
      return await customerOverview.query(input);
    }),
  get: publicProcedure.input(uniqueCustomerInput).query(async ({ input }) => {
    return await db.query.customer.findFirst({
      where: eq(schema.base.customer.id, input.id),
    });
  }),
} satisfies TRPCRouterRecord;
