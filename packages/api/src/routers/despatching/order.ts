import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import {
  paginationSchema,
  sortSchema,
  stringFilterSchema,
} from "../../lib/schemas";
import { publicProcedure } from "../../trpc";

const uniqueOrderInput = z.object({
  id: z.number(),
});

const listOrderInput = z.object({
  pagination: paginationSchema(),
  filter: z.object({}),
  sort: sortSchema(["id", "accountId"]),
});

export const salesOrderRouter = {
  list: publicProcedure.input(listOrderInput).query(async ({ input }) => {
    return db.query.salesOrder.findMany({
      limit: input.pagination.size,
      offset: (input.pagination.page - 1) * input.pagination.size,
      with: {
        customer: true,
      },
    });
  }),
  get: publicProcedure.input(uniqueOrderInput).query(async ({ input }) => {
    return db.query.salesOrder.findFirst({
      where: eq(schema.salesOrder.id, input.id),
      with: {
        customer: true,
        items: {
          with: {
            component: true,
          },
        },
      },
    });
  }),
} satisfies TRPCRouterRecord;
