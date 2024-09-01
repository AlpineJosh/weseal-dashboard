import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { createTRPCRouter, publicProcedure } from "../../trpc";

const uniqueOrderInput = z.object({
  id: z.number(),
});

const listOrderInput = z
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

export const purchaseOrderRouter = createTRPCRouter({
  list: publicProcedure.input(listOrderInput).query(async ({ input }) => {
    return db.query.purchaseOrder.findMany({
      limit: input.pagination.size,
      offset: (input.pagination.page - 1) * input.pagination.size,
    });
  }),
  get: publicProcedure.input(uniqueOrderInput).query(async ({ input }) => {
    return db.query.purchaseOrder.findFirst({
      where: eq(schema.purchaseOrder.id, input.id),
    });
  }),
});
