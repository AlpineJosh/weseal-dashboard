import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { publicProcedure } from "../../trpc";

const uniqueCustomerInput = z.object({
  id: z.string(),
});

const listCustomerInput = z
  .object({
    pagination: z.object({
      page: z.number(),
      size: z.number(),
    }),
  })
  .optional()
  .default({
    pagination: {
      page: 1,
      size: 10,
    },
  });

export const customerRouter = {
  list: publicProcedure.input(listCustomerInput).query(async ({ input }) => {
    return db.query.customer.findMany({
      limit: input.pagination.size,
      offset: (input.pagination.page - 1) * input.pagination.size,
    });
  }),
  get: publicProcedure.input(uniqueCustomerInput).query(async ({ input }) => {
    return db.query.customer.findFirst({
      where: eq(schema.customer.id, input.id),
    });
  }),
} satisfies TRPCRouterRecord;
