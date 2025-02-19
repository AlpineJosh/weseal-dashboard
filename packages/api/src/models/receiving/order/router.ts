import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { publicSchema } from "@repo/db";

import { db } from "../../../db";
import { decimal } from "../../../lib/decimal";
import { publicProcedure } from "../../../trpc";
import overview from "./model";

export const uniqueOrderSchema = z.object({
  id: z.number(),
});

const receiveOrderInput = z.object({
  id: z.number(),
  putLocationId: z.number(),
  items: z.array(
    z.object({
      componentId: z.string(),
      quantity: decimal(),
    }),
  ),
});

export const purchaseOrderRouter = {
  get: publicProcedure.input(uniqueOrderSchema).query(async ({ input }) => {
    return await overview.findFirst({ filter: { id: { eq: input.id } } });
  }),
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
  }),
  receive: publicProcedure
    .input(receiveOrderInput)
    .mutation(async ({ input }) => {
      return await db.transaction(async (tx) => {
        const receiptDate = new Date();

        const receipts = await tx
          .insert(publicSchema.purchaseReceipt)
          .values({
            orderId: input.id,
            receiptDate,
          })
          .returning({
            id: publicSchema.purchaseReceipt.id,
          });

        const receipt = receipts[0];
        if (!receipt) {
          throw new Error("Receipt not created");
        }

        for (const item of input.items) {
          const batches = await tx
            .insert(publicSchema.batch)
            .values({
              componentId: item.componentId,
            })
            .onConflictDoNothing()
            .returning({ id: publicSchema.batch.id });

          const batch = batches[0];

          if (!batch) {
            throw new Error("Batch not created");
          }

          const receiptItem = await tx
            .insert(publicSchema.purchaseReceiptItem)
            .values({
              componentId: item.componentId,
              receiptId: receipt.id,
              quantity: item.quantity,
            })
            .returning({ id: publicSchema.purchaseReceiptItem.id });

          if (!receiptItem[0]) {
            throw new Error("Receipt item not created");
          }

          // await tx.insert(publicSchema.inventoryLedger).values({
          //   batchId: batch.id,
          //   quantity: item.quantity,
          //   userId: ctx.user.id,
          //   type: "receipt",
          //   locationId: input.putLocationId,
          //   date: receiptDate,
          //   purchaseReceiptItemId: receiptItem[0].id,
          // });
        }

        return receipt;
      });
    }),
} satisfies TRPCRouterRecord;

export type PurchaseOrderRouter = typeof purchaseOrderRouter;
