import { sql } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { asyncBatch, buildQuery } from "~/lib/helpers";
import { sage } from "~/lib/sage/sage";
import { SALES_LEDGER, SALES_ORDER, SOP_ITEM } from "~/lib/sage/types";
import { SyncParameters } from "./types";

export async function syncSalesLedger(parameters?: SyncParameters) {
  const query = buildQuery("SELECT * FROM SALES_LEDGER", parameters);
  const result = await sage().query<SALES_LEDGER>(query);

  const salesLedger: (typeof schema.customer.$inferInsert)[] = [];

  result.map((row) => {
    if (row.RECORD_DELETED === 1) {
      return;
    }

    salesLedger.push({
      id: row.ACCOUNT_REF,
      name: row.NAME,
      lastModified: new Date(row.RECORD_MODIFY_DATE),
      createdAt: new Date(row.RECORD_CREATE_DATE),
    });
  });

  await asyncBatch(salesLedger, async (batch) => {
    await db
      .insert(schema.customer)
      .values(batch)
      .onConflictDoUpdate({
        target: schema.customer.id,
        set: {
          name: sql<string>`excluded.name`,
          lastModified: sql<Date>`excluded.lastModified`,
          createdAt: sql<Date>`excluded.createdAt`,
        },
      });
  });
}

export async function syncSalesOrders(parameters?: SyncParameters) {
  const query = buildQuery("SELECT * FROM SALES_ORDER", parameters);
  const result = await sage().query<SALES_ORDER>(query);

  const salesOrders: (typeof schema.salesOrder.$inferInsert)[] = [];

  result.map((row) => {
    if (row.RECORD_DELETED === 1) {
      return;
    }

    salesOrders.push({
      id: row.ORDER_NUMBER,
      customerId: row.ACCOUNT_REF,
      isQuote: row.ORDER_OR_QUOTE !== "Sales Order",
      isCancelled: row.ORDER_TYPE_CODE !== 2,
      isComplete: row.DESPATCH_STATUS === "Complete",
      orderDate: new Date(row.ORDER_DATE),
      lastModified: new Date(row.RECORD_MODIFY_DATE),
      createdAt: new Date(row.RECORD_CREATE_DATE),
    });
  });

  await asyncBatch(salesOrders, async (batch) => {
    await db
      .insert(schema.salesOrder)
      .values(batch)
      .onConflictDoUpdate({
        target: schema.salesOrder.id,
        set: {
          customerId: sql<string>`excluded.customerId`,
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

export async function syncSalesOrderItems(parameters?: SyncParameters) {
  const query = buildQuery("SELECT * FROM SOP_ITEM", parameters);
  const result = await sage().query<SOP_ITEM>(query);

  const salesOrderItems: (typeof schema.salesOrderItem.$inferInsert)[] = [];

  result.map((row) => {
    if (row.RECORD_DELETED === 1) {
      return;
    }

    salesOrderItems.push({
      id: row.ITEMID,
      orderId: row.ORDER_NUMBER,
      componentId: row.STOCK_CODE,
      quantity: row.QTY_ORDER,
      createdAt: new Date(row.RECORD_CREATE_DATE),
      lastModified: new Date(row.RECORD_MODIFY_DATE),
    });
  });

  await asyncBatch(salesOrderItems, async (batch) => {
    await db
      .insert(schema.salesOrderItem)
      .values(batch)
      .onConflictDoUpdate({
        target: schema.salesOrderItem.id,
        set: {
          orderId: sql<number>`excluded.orderId`,
          componentId: sql<string>`excluded.componentId`,
          quantity: sql<number>`excluded.quantity`,
          lastModified: sql<Date>`excluded.lastModified`,
          createdAt: sql<Date>`excluded.createdAt`,
        },
      });
  });
}
