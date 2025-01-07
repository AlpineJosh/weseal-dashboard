import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";
import { purchaseOrderItemRouter } from "./item";

const uniqueOrderInput = z.object({
  id: z.number(),
});

const orderOverview = datatable(schema.base.purchaseOrderOverview);

const receiveOrderInput = z.object({
  id: z.number(),
  putLocationId: z.number(),
  items: z.array(
    z.object({
      componentId: z.string(),
      quantity: z.number(),
    }),
  ),
});

export const purchaseOrderRouter = {
  get: publicProcedure.input(uniqueOrderInput).query(async ({ input }) => {
    return db.query.purchaseOrderOverview.findFirst({
      where: eq(schema.base.purchaseOrderOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(orderOverview.inputSchema)
    .query(async ({ input }) => {
      return await orderOverview.query(input);
    }),
  items: purchaseOrderItemRouter,
  receive: publicProcedure
    .input(receiveOrderInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        const receiptDate = new Date();

        const receipts = await tx
          .insert(schema.base.purchaseReceipt)
          .values({
            orderId: input.id,
            isReceived: true,
            receiptDate,
          })
          .returning({
            id: schema.base.purchaseReceipt.id,
          });

        const receipt = receipts[0];
        if (!receipt) {
          throw new Error("Receipt not created");
        }

        for (const item of input.items) {
          const batches = await tx
            .insert(schema.base.batch)
            .values({
              componentId: item.componentId,
              entryDate: receiptDate,
            })
            .onConflictDoNothing()
            .returning({ id: schema.base.batch.id });

          const batch = batches[0];

          if (!batch) {
            throw new Error("Batch not created");
          }

          const receiptItem = await tx
            .insert(schema.base.purchaseReceiptItem)
            .values({
              receiptId: receipt.id,
              batchId: batch.id,
              quantity: item.quantity,
            })
            .returning({ id: schema.base.purchaseReceiptItem.id });

          if (!receiptItem[0]) {
            throw new Error("Receipt item not created");
          }

          await tx.insert(schema.base.batchMovement).values({
            batchId: batch.id,
            quantity: item.quantity,
            userId: ctx.user.id,
            type: "receipt",
            locationId: input.putLocationId,
            date: receiptDate,
            purchaseReceiptItemId: receiptItem[0].id,
          });
        }

        return receipt;
      });
    }),
} satisfies TRPCRouterRecord;
