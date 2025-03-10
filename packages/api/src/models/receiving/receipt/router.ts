import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { schema } from "@repo/db";

import { db } from "../../../db";
import { decimal } from "../../../lib/decimal";
import { publicProcedure } from "../../../trpc";
import { processReceipt } from "../../inventory/model";
import overview from "./model";

export const uniqueReceiptSchema = z.object({
  id: z.number(),
});

const receiveReceiptInput = z.object({
  orderId: z.number(),
  items: z.array(
    z.object({
      componentId: z.string(),
      quantity: decimal(),
    }),
  ),
  locationId: z.number(),
});

export const purchaseReceiptRouter = {
  get: publicProcedure.input(uniqueReceiptSchema).query(async ({ input }) => {
    return await overview.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
  }),
  receive: publicProcedure
    .input(receiveReceiptInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        const receipts = await tx
          .insert(schema.purchaseReceipt)
          .values({
            orderId: input.orderId,
            receiptDate: new Date(),
          })
          .returning();

        const receipt = receipts[0];

        if (!receipt) {
          throw new Error("Failed to create purchase receipt");
        }

        const items = await tx
          .insert(schema.purchaseReceiptItem)
          .values(
            input.items.map((item) => ({
              receiptId: receipt.id,
              componentId: item.componentId,
              quantity: item.quantity,
            })),
          )
          .returning();

        for (const item of items) {
          await processReceipt(
            tx,
            {
              componentId: item.componentId,
            },
            input.locationId,
            item.quantity,
            new Date(),
            item.id,
            ctx.user.id,
          );
        }
      });
    }),
} satisfies TRPCRouterRecord;

export type PurchaseReceiptRouter = typeof purchaseReceiptRouter;
