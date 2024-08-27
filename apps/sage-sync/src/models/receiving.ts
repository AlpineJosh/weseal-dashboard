import { sql } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { asyncBatch, buildQuery } from "~/lib/helpers";
import { sage } from "~/lib/sage/sage";
import { POP_ITEM, PURCHASE_LEDGER, PURCHASE_ORDER } from "~/lib/sage/types";
import { SyncParameters } from "./types";

export async function syncPurchaseLedger(parameters?: SyncParameters) {
  const query = buildQuery("SELECT * FROM PURCHASE_LEDGER", parameters);
  const result = await sage().query<PURCHASE_LEDGER>(query);

  const purchaseLedger: (typeof schema.supplier.$inferInsert)[] = [];

  result.map((row) => {
    if (row.RECORD_DELETED === 1) {
      return;
    }

    purchaseLedger.push({
      id: row.ACCOUNT_REF,
      name: row.NAME,
      lastModified: new Date(row.RECORD_MODIFY_DATE),
      createdAt: new Date(row.RECORD_CREATE_DATE),
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
          lastModified: sql<Date>`excluded.lastModified`,
          createdAt: sql<Date>`excluded.createdAt`,
        },
      });
  });
}

export async function syncPurchaseOrders(parameters?: SyncParameters) {
  const query = buildQuery("SELECT * FROM PURCHASE_ORDER", parameters);
  const result = await sage().query<PURCHASE_ORDER>(query);

  const purchaseOrders: (typeof schema.purchaseOrder.$inferInsert)[] = [];

  result.map((row) => {
    if (row.RECORD_DELETED === 1) {
      return;
    }

    purchaseOrders.push({
      id: row.ORDER_NUMBER,
      supplierId: row.ACCOUNT_REF,
      isQuote: row.ORDER_OR_QUOTE === "QUOTE",
      isCancelled: row.ORDER_STATUS === "CANCELLED",
      isComplete: row.DELIVERY_STATUS === "COMPLETE",
      orderDate: new Date(row.ORDER_DATE),
      lastModified: new Date(row.RECORD_MODIFY_DATE),
      createdAt: new Date(row.RECORD_CREATE_DATE),
    });
  });

  await asyncBatch(purchaseOrders, async (batch) => {
    await db
      .insert(schema.purchaseOrder)
      .values(batch)
      .onConflictDoUpdate({
        target: schema.purchaseOrder.id,
        set: {
          supplierId: sql<string>`excluded.supplierId`,
          isQuote: sql<boolean>`excluded.isQuote`,
          isComplete: sql<boolean>`excluded.isComplete`,
          isCancelled: sql<boolean>`excluded.isCancelled`,
          orderDate: sql<Date>`excluded.orderDate`,
          lastModified: sql<Date>`excluded.lastModified`,
          createdAt: sql<Date>`excluded.createdAt`,
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
    if (row.RECORD_DELETED === 1) {
      return;
    }

    purchaseOrderItems.push({
      id: row.ITEMID,
      orderId: row.ORDER_NUMBER,
      componentId: row.STOCK_CODE,
      quantityOrdered: row.QTY_ORDER,
      createdAt: new Date(row.RECORD_CREATE_DATE),
      lastModified: new Date(row.RECORD_MODIFY_DATE),
    });
  });

  await asyncBatch(purchaseOrderItems, async (batch) => {
    await db
      .insert(schema.purchaseOrderItem)
      .values(batch)
      .onConflictDoUpdate({
        target: schema.purchaseOrderItem.id,
        set: {
          orderId: sql<number>`excluded.orderId`,
          componentId: sql<string>`excluded.componentId`,
          quantityOrdered: sql<number>`excluded.quantityOrdered`,
          lastModified: sql<Date>`excluded.lastModified`,
          createdAt: sql<Date>`excluded.createdAt`,
        },
      });
  });
}
