import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";
import { salesOrderItemRouter } from "./item";

const uniqueOrderInput = z.object({
  id: z.number(),
});

const orderOverview = datatable(schema.base.salesOrderOverview);

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
    return await db.query.salesOrderOverview.findFirst({
      where: eq(schema.base.salesOrderOverview.id, input.id),
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
        const despatches = await tx
          .insert(schema.base.salesDespatch)
          .values({
            orderId: input.id,
            despatchDate: input.despatchDate,
            isDespatched: true,
          })
          .returning({ id: schema.base.salesDespatch.id });

        if (!despatches[0]) {
          throw new Error("Failed to create despatch");
        }

        const despatch = despatches[0];

        for (const item of input.items) {
          const despatchItems = await tx
            .insert(schema.base.salesDespatchItem)
            .values({
              despatchId: despatch.id,
              batchId: item.batchId,
              quantity: item.quantity,
            })
            .returning({ id: schema.base.salesDespatchItem.id });

          if (!despatchItems[0]) {
            throw new Error("Failed to create despatch item");
          }

          const despatchItem = despatchItems[0];

          await tx.insert(schema.base.batchMovement).values({
            batchId: item.batchId,
            quantity: -item.quantity,
            userId: "",
            type: "despatch",
            locationId: item.pickLocationId,
            date: input.despatchDate,
            salesDespatchItemId: despatchItem.id,
          });

          return despatch;
        }
      });
    }),
} satisfies TRPCRouterRecord;
