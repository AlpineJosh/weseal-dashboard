import { number } from "zod";

import { desc, eq, sql } from "@repo/db";
import { bitSystemsDb, bitSystemsSchema } from "@repo/db/bit-systems";
import { db } from "@repo/db/client";
import { sageDb, sageSchema } from "@repo/db/sage";
import schema from "@repo/db/schema";

export const resetInventory = async () => {
  console.log("Resetting inventory");

  await db.execute(sql`
    TRUNCATE TABLE 
      public.batch_movement_correction,
      public.production_batch_input,
      public.production_batch_output,
      public.batch_movement,
      public.production_job,
      public.sales_despatch_item,
      public.sales_despatch,
      public.purchase_receipt_item,
      public.purchase_receipt,
      public.task_item,
      public.task,
      public.batch 
    RESTART IDENTITY;
  `);

  console.log("Fetching transactions");

  const transactions = await sageDb.query.STOCK_TRAN.findMany().then(
    (transactions) =>
      transactions.map((t) => {
        let type = "correction";
        if (t.TYPE?.startsWith("M") || t.REFERENCE?.startsWith("BOM")) {
          type = "production";
        } else if (t.TYPE === "GI") {
          type = "receipt";
        } else if (t.TYPE === "GD") {
          type = "despatch";
        }
        return {
          id: t.TRAN_NUMBER,
          component_id: t.STOCK_CODE,
          quantity: t.QUANTITY ?? 0,
          date: t.DATE,
          reference: t.REFERENCE,
          reference_numeric: t.REFERENCE_NUMERIC,
          type,
          created_at: t.RECORD_CREATE_DATE ?? t.DATE,
          last_modified: t.RECORD_MODIFY_DATE ?? t.RECORD_CREATE_DATE ?? t.DATE,
          sales_order_id: undefined as number | undefined,
          purchase_order_id: undefined as number | undefined,
          batch_reference: undefined as string | undefined,
          batch_id: undefined as number | undefined,
          purchaseReceiptItemId: undefined as number | undefined,
          salesDespatchItemId: undefined as number | undefined,
        };
      }),
  );

  console.log("Linking sales order items to transactions");

  const sop_items = await sageDb.query.SOP_ITEM.findMany();
  const gdnItems = await sageDb.query.GDN_ITEM.findMany();

  transactions.forEach((t) => {
    if (t.type === "despatch") {
      const sop_item = sop_items.find(
        (s) =>
          s.STOCK_CODE === t.component_id &&
          s.ORDER_NUMBER === t.reference_numeric &&
          s.QTY_DELIVERED === -t.quantity &&
          s.DELIVERY_DATE === t.date,
      );
      if (sop_item) {
        t.sales_order_id = sop_item.ORDER_NUMBER ?? undefined;
      } else {
        const gdnItem = gdnItems.find(
          (g) =>
            g.STOCK_CODE === t.component_id &&
            g.DATE === t.date &&
            g.QTY_DESPATCHED === -t.quantity,
        );
        if (gdnItem) {
          t.sales_order_id = gdnItem.ORDER_NUMBER ?? undefined;
        } else {
          t.type = "correction";
        }
      }
    }
  });

  console.log("Linking purchase order items to transactions");

  const pop_items = await sageDb.query.POP_ITEM.findMany();
  const grnItems = await sageDb.query.GRN_ITEM.findMany();

  transactions.forEach((t) => {
    if (t.type === "receipt") {
      const pop_item = pop_items.find(
        (s) =>
          s.STOCK_CODE === t.component_id &&
          s.ORDER_NUMBER === t.reference_numeric &&
          s.QTY_DELIVERED === t.quantity &&
          s.DELIVERY_DATE === t.date,
      );
      if (pop_item) {
        t.purchase_order_id = pop_item.ORDER_NUMBER ?? undefined;
      } else {
        const grnItem = grnItems.find(
          (g) =>
            g.STOCK_CODE === t.component_id &&
            g.DATE === t.date &&
            g.QTY_RECEIVED === t.quantity,
        );
        if (grnItem) {
          t.purchase_order_id = grnItem.ORDER_NUMBER ?? undefined;
        } else {
          t.type = "correction";
        }
      }
    }
  });

  console.log("Fetching traceable items");

  const traceable_items = await bitSystemsDb
    .select({
      component_id: bitSystemsSchema.stockItem.Code,
      batch_reference: bitSystemsSchema.traceableItem.IdentificationNo,
      created_at: bitSystemsSchema.traceableItem.DateTimeCreated,
    })
    .from(bitSystemsSchema.traceableItem)
    .leftJoin(
      bitSystemsSchema.stockItem,
      eq(
        bitSystemsSchema.traceableItem.fk_StockItem_ID,
        bitSystemsSchema.stockItem.pk_StockItem_ID,
      ),
    );

  console.log("Linking traceable items to transactions");

  transactions.forEach((t) => {
    if (t.type === "production" && t.quantity > 0) {
      const traceable_item = traceable_items.find(
        (ti) =>
          ti.component_id === t.component_id &&
          ti.created_at &&
          t.created_at &&
          Math.abs(ti.created_at.getTime() - t.created_at.getTime()) <
            1000 * 60,
      );
      if (traceable_item) {
        t.batch_reference = traceable_item.batch_reference ?? undefined;
      }
    }
  });

  console.log("Creating batches");

  const batches: {
    batch_id: number;
    component_id: string;
    remaining: number;
  }[] = [];

  for (const t of transactions) {
    if (t.quantity > 0) {
      if (t.type === "production" || t.type === "receipt") {
        const batch = {
          reference:
            (t.batch_reference ?? t.purchase_order_id)
              ? "PO-" + t.purchase_order_id
              : "",
          componentId: t.component_id!,
          entryDate: t.date!,
          createdAt: t.created_at!,
          lastModified: t.last_modified!,
        };
        const results = await db
          .insert(schema.batch)
          .values(batch)
          .returning({ id: schema.batch.id });
        t.batch_id = results[0]?.id;
      } else {
        const result = await db.query.batch.findFirst({
          where: eq(schema.batch.componentId, t.component_id!),
          orderBy: desc(schema.batch.lastModified),
        });
        if (result) {
          t.batch_id = result.id;
        } else {
          const results = await db
            .insert(schema.batch)
            .values({
              componentId: t.component_id!,
              entryDate: t.date!,
              createdAt: t.created_at!,
              lastModified: t.last_modified!,
            })
            .returning({ id: schema.batch.id });
          t.batch_id = results[0]?.id;
        }
      }
    }
  }

  console.log("Creating batch movements");

  const batch_movements = [];

  for (const t of transactions) {
    if (t.quantity === 0) continue;
    if (t.quantity > 0) {
      const batch = batches.find((b) => b.batch_id === t.batch_id);
      if (batch) {
        batch.remaining += t.quantity;
      }
      batch_movements.push({
        batchId: t.batch_id!,
        quantity: t.quantity,
        date: t.date!,
        type: t.type,
        created_at: t.created_at,
        last_modified: t.last_modified,
      });
    }
    if (t.quantity < 0) {
      const matching = batches.filter(
        (b) => b.component_id === t.component_id && b.remaining > 0,
      );
      if (matching.length > 0) {
        while (t.quantity < 0 && matching.length > 0) {
          const batch = matching.shift();
          if (batch) {
            const quantityToMove = Math.min(-t.quantity, batch.remaining);

            batch_movements.push({
              batchId: batch.batch_id,
              quantity: quantityToMove,
              type: t.type,
              date: t.date!,
              created_at: t.created_at,
              last_modified: t.last_modified,
            });
            batch.remaining -= quantityToMove;
            t.quantity += quantityToMove;
          }
        }
        if (t.quantity < 0) {
          const batch = batches.find(
            (b) => b.component_id === t.component_id && b.remaining > 0,
          );
          if (batch) {
            batch_movements.push({
              batchId: batch.batch_id,
              quantity: -t.quantity,
              type: t.type,
              date: t.date!,
              created_at: t.created_at,
              last_modified: t.last_modified,
            });
            batch.remaining -= t.quantity;
          }
        }
      }
    }
  }

  console.log("Creating purchase receipts");

  const purchaseReceiptItems = transactions.filter(
    (t) => t.type === "receipt" && t.purchase_order_id,
  );
  const purchaseReceipts = new Set(
    purchaseReceiptItems.map((t) => ({
      orderId: t.purchase_order_id!,
      receiptDate: t.date!,
    })),
  );
  const receipts = [];

  for (let i = 0; i < purchaseReceipts.size; i += 1000) {
    const receiptsChunk = Array.from(purchaseReceipts).slice(i, i + 1000);
    const results = await db
      .insert(schema.purchaseReceipt)
      .values(receiptsChunk)
      .onConflictDoNothing()
      .returning({
        id: schema.purchaseReceipt.id,
        date: schema.purchaseReceipt.receiptDate,
        orderId: schema.purchaseReceipt.orderId,
      });
    receipts.push(...results);
  }

  console.log("Linking purchase receipts to items");

  for (const r of purchaseReceiptItems) {
    const receipt = receipts.find(
      (r) => r.date === r.date && r.orderId === r.orderId,
    );
    if (receipt) {
      const results = await db
        .insert(schema.purchaseReceiptItem)
        .values({
          receiptId: receipt.id!,
          batchId: r.batch_id!,
          quantity: r.quantity,
          createdAt: r.created_at!,
          lastModified: r.last_modified!,
        })
        .returning({ id: schema.purchaseReceiptItem.id });
      r.purchaseReceiptItemId = results[0]?.id;
    }
  }

  console.log("Creating sales despatches");

  const salesDespatchItems = transactions.filter(
    (t) => t.type === "despatch" && t.sales_order_id,
  );
  const salesDespatches = new Set(
    salesDespatchItems.map((t) => ({
      orderId: t.sales_order_id!,
      receiptDate: t.date!,
    })),
  );
  const despatches = [];

  for (let i = 0; i < salesDespatches.size; i += 1000) {
    const despatchesChunk = Array.from(salesDespatches).slice(i, i + 1000);
    const results = await db
      .insert(schema.salesDespatch)
      .values(despatchesChunk)
      .onConflictDoNothing()
      .returning({
        id: schema.salesDespatch.id,
        date: schema.salesDespatch.despatchDate,
        orderId: schema.salesDespatch.orderId,
      });
    despatches.push(...results);
  }

  console.log("Linking sales despatches to items");

  for (const r of salesDespatchItems) {
    const despatch = despatches.find(
      (r) => r.date === r.date && r.orderId === r.orderId,
    );
    if (despatch) {
      const results = await db
        .insert(schema.salesDespatchItem)
        .values({
          despatchId: despatch.id!,
          batchId: r.batch_id!,
          quantity: -r.quantity,
          createdAt: r.created_at!,
          lastModified: r.last_modified!,
        })
        .onConflictDoNothing()
        .returning({ id: schema.salesDespatchItem.id });
      r.salesDespatchItemId = results[0]?.id;
    }
  }

  console.log("Saving batch movements");

  for (let i = 0; i < batch_movements.length; i += 1000) {
    const batch_movements_chunk = batch_movements
      .slice(i, i + 1000)
      .map((bm) => ({
        batchId: bm.batchId,
        quantity: bm.quantity,
        date: bm.date,
        type: bm.type as "correction" | "production" | "receipt" | "despatch",
        locationId: 1,
        userId: "1",
        createdAt: bm.created_at!,
        lastModified: bm.last_modified!,
      }));
    await db
      .insert(schema.batchMovement)
      .values(batch_movements_chunk)
      .onConflictDoNothing();
  }
};
