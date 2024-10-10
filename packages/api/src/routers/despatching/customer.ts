import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, count, eq, sum } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../lib/datatable";
import { publicProcedure } from "../../trpc";

const uniqueCustomerInput = z.object({
  id: z.string(),
});

const customerOverview = datatable(schema.customer);

export const customerRouter = {
  list: publicProcedure
    .input(customerOverview.inputSchema)
    .query(async ({ input }) => {
      return await customerOverview.query(input);
    }),
  get: publicProcedure.input(uniqueCustomerInput).query(async ({ input }) => {
    return db.query.customer.findFirst({
      where: eq(schema.customer.id, input.id),
    });
  }),
} satisfies TRPCRouterRecord;
