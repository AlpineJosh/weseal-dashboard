import { sql } from "@repo/db";
import schema from "@repo/db/schema";
import { db } from "@repo/db/server";

import { asyncBatch, buildQuery } from "~/lib/helpers";
import { sage } from "~/lib/sage/sage";
import { POP_ITEM, PURCHASE_LEDGER, PURCHASE_ORDER } from "~/lib/sage/types";
import { SyncParameters } from "./types";

export async function syncPurchaseLedger(parameters?: SyncParameters) {
  const query = buildQuery("SELECT * FROM PURCHASE_LEDGER", parameters);
  const result = await sage().query<PURCHASE_LEDGER>(query);

  const purchaseLedger: (typeof schema.supplier.$inferInsert)[] = [];

  result.map((row) => {
    purchaseLedger.push({
      id: row.ACCOUNT_REF,
      name: row.NAME,
      lastModified: new Date(row.RECORD_MODIFY_DATE),
      createdAt: new Date(row.RECORD_CREATE_DATE),
      isDeleted: row.RECORD_DELETED === 1,
    });
  });

  await asyncBatch(purchaseLedger, async (batch) => {
    await db
      .insert(schema.supplier)
      .values(batch)
      .onConflictDoUpdate({
        target: schema.supplier.id,
        set: {
          name: sql<string>`excluded.name`,
          lastModified: sql<Date>`excluded.last_modified`,
          createdAt: sql<Date>`excluded.created_at`,
          isDeleted: sql<boolean>`excluded.is_deleted`,
        },
      });
  });
}

export async function syncPurchaseOrders(parameters?: SyncParameters) {
  const query = buildQuery("SELECT * FROM PURCHASE_ORDER", parameters);
  const result = await sage().query<PURCHASE_ORDER>(query);

  const purchaseOrders: (typeof schema.purchaseOrder.$inferInsert)[] = [];

  result.map((row) => {
    purchaseOrders.push({
      id: row.ORDER_NUMBER,
      supplierId: row.ACCOUNT_REF,
      isQuote: row.ORDER_OR_QUOTE === "QUOTE",
      isCancelled: row.ORDER_STATUS === "CANCELLED",
      isComplete: row.DELIVERY_STATUS === "COMPLETE",
      orderDate: new Date(row.ORDER_DATE),
      lastModified: new Date(row.RECORD_MODIFY_DATE),
      createdAt: new Date(row.RECORD_CREATE_DATE),
      isDeleted: row.RECORD_DELETED === 1,
    });
  });

  await asyncBatch(purchaseOrders, async (batch) => {
    await db
      .insert(schema.purchaseOrder)
      .values(batch)
      .onConflictDoUpdate({
        target: schema.purchaseOrder.id,
        set: {
          supplierId: sql<string>`excluded.supplier_id`,
          isQuote: sql<boolean>`excluded.is_quote`,
          isComplete: sql<boolean>`excluded.is_complete`,
          isCancelled: sql<boolean>`excluded.is_cancelled`,
          orderDate: sql<Date>`excluded.order_date`,
          lastModified: sql<Date>`excluded.last_modified`,
          createdAt: sql<Date>`excluded.created_at`,
          isDeleted: sql<boolean>`excluded.is_deleted`,
        },
      });
  });
}

export async function syncPurchaseOrderItems(parameters?: SyncParameters) {
  const query = buildQuery("SELECT * FROM POP_ITEM", parameters);
  const result = await sage().query<POP_ITEM>(query);

  const purchaseOrderItems: (typeof schema.purchaseOrderItem.$inferInsert)[] =
    [];

  result.map((row) => {
    if (["M", "S1", "S2", "S3"].includes(row.STOCK_CODE)) {
      return;
    }

    purchaseOrderItems.push({
      id: row.ITEMID,
      orderId: row.ORDER_NUMBER,
      componentId: row.STOCK_CODE,
      quantityOrdered: row.QTY_ORDER,
      sageQuantityReceived: row.QTY_DELIVERED,
      createdAt: new Date(row.RECORD_CREATE_DATE),
      lastModified: new Date(row.RECORD_MODIFY_DATE),
      isDeleted: row.RECORD_DELETED === 1,
    });
  });

  await asyncBatch(purchaseOrderItems, async (batch) => {
    await db
      .insert(schema.purchaseOrderItem)
      .values(batch)
      .onConflictDoUpdate({
        target: schema.purchaseOrderItem.id,
        set: {
          orderId: sql<number>`excluded.order_id`,
          componentId: sql<string>`excluded.component_id`,
          quantityOrdered: sql<number>`excluded.quantity_ordered`,
          sageQuantityReceived: sql<number>`excluded.sage_quantity_received`,
          lastModified: sql<Date>`excluded.last_modified`,
          createdAt: sql<Date>`excluded.created_at`,
          isDeleted: sql<boolean>`excluded.is_deleted`,
        },
      });
  });
}
