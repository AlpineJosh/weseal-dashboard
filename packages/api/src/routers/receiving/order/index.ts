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
  receiptDate: z.date(),
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
    .mutation(async ({ input }) => {
      return await db.transaction(async (tx) => {
        const receipt = await tx
          .insert(schema.base.purchaseReceipt)
          .values({
            orderId: input.id,
            receiptDate: input.receiptDate,
            isReceived: true,
          })
          .returning({ id: schema.base.purchaseReceipt.id });

        if (!receipt[0]) {
          throw new Error("Receipt not created");
        }

        for (const item of input.items) {
          const batch = await tx
            .insert(schema.base.batch)
            .values({
              componentId: item.componentId,
              entryDate: input.receiptDate,
            })
            .onConflictDoNothing()
            .returning({ id: schema.base.batch.id });

          if (!batch[0]) {
            throw new Error("Batch not created");
          }

          const receiptItem = await tx
            .insert(schema.base.purchaseReceiptItem)
            .values({
              receiptId: receipt[0].id,
              batchId: batch[0].id,
              quantity: item.quantity,
            })
            .returning({ id: schema.base.purchaseReceiptItem.id });

          if (!receiptItem[0]) {
            throw new Error("Receipt item not created");
          }

          await tx.insert(schema.base.batchMovement).values({
            batchId: batch[0].id,
            quantity: item.quantity,
            userId: "",
            type: "receipt",
            locationId: input.putLocationId,
            date: input.receiptDate,
            purchaseReceiptItemId: receiptItem[0].id,
          });

          return receipt[0];
        }
      });
    }),
} satisfies TRPCRouterRecord;
