import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";
import { salesOrderItemRouter } from "./item";

const uniqueOrderInput = z.object({
  id: z.number(),
});

const orderOverview = datatable(schema.salesOrderOverview);

const despatchOrderInput = z.object({
  id: z.number(),
  despatchDate: z.date(),
  items: z.array(
    z.object({
      pickLocationId: z.number(),
      batchId: z.number(),
      quantity: z.number(),
    }),
  ),
});

export const salesOrderRouter = {
  get: publicProcedure.input(uniqueOrderInput).query(async ({ input }) => {
    return db.query.salesOrderOverview.findFirst({
      where: eq(schema.salesOrderOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(orderOverview.inputSchema)
    .query(async ({ input }) => {
      return await orderOverview.query(input);
    }),
  items: salesOrderItemRouter,
  despatch: publicProcedure
    .input(despatchOrderInput)
    .mutation(async ({ input }) => {
      return await db.transaction(async (tx) => {
        const despatch = await tx
          .insert(schema.salesDespatch)
          .values({
            orderId: input.id,
            despatchDate: input.despatchDate,
            isDespatched: true,
          })
          .returning({ id: schema.salesDespatch.id });

        for (const item of input.items) {
          const despatchItem = await tx
            .insert(schema.salesDespatchItem)
            .values({
              despatchId: despatch[0]!.id,
              batchId: item.batchId,
              quantity: item.quantity,
            })
            .returning({ id: schema.salesDespatchItem.id });

          await tx.insert(schema.batchMovement).values({
            batchId: item.batchId,
            quantity: -item.quantity,
            userId: "",
            type: "despatch",
            locationId: item.pickLocationId,
            date: input.despatchDate,
            salesDespatchItemId: despatchItem[0]!.id,
          });

          return despatch[0];
        }
      });
    }),
} satisfies TRPCRouterRecord;
