import { sql } from "@repo/db";
import { db } from "@repo/db/server";
import schema from "@repo/db/schema";

import { asyncBatch, buildQuery } from "~/lib/helpers";
import { sage, sageQuery } from "~/lib/sage/sage";
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
          lastModified: sql<Date>`excluded.last_modified`,
          createdAt: sql<Date>`excluded.created_at`,
        },
      });
  });
}

export async function syncSalesOrders(parameters?: SyncParameters) {
  const query = buildQuery("SELECT * FROM SALES_ORDER", parameters);
  const result = await sage().query<SALES_ORDER>(query);

  const salesOrders: (typeof schema.salesOrder.$inferInsert)[] = [];

  result.map((row) => {
    if (row.RECORD_DELETED === 1 || row.ACCOUNT_REF === "") {
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
          customerId: sql<string>`excluded.customer_id`,
          isQuote: sql<boolean>`excluded.is_quote`,
          isComplete: sql<boolean>`excluded.is_complete`,
          isCancelled: sql<boolean>`excluded.is_cancelled`,
          orderDate: sql<Date>`excluded.order_date`,
          lastModified: sql<Date>`excluded.last_modified`,
          createdAt: sql<Date>`excluded.created_at`,
        },
      });
  });
}

export async function syncSalesOrderItems(parameters?: SyncParameters) {
  const result = await sageQuery<SOP_ITEM, "ITEMID">("SOP_ITEM", "ITEMID", parameters);

  const salesOrderItems: (typeof schema.salesOrderItem.$inferInsert)[] = [];

  result.map((row) => {
    if (row.RECORD_DELETED === 1 || [18543, 18555].includes(row.ORDER_NUMBER)) {
      return;
    }

    if (["M", "S1", "S2", "S3"].includes(row.STOCK_CODE)) {
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
          orderId: sql<number>`excluded.order_id`,
          componentId: sql<string>`excluded.component_id`,
          quantity: sql<number>`excluded.quantity`,
          lastModified: sql<Date>`excluded.last_modified`,
          createdAt: sql<Date>`excluded.created_at`,
        },
      });
  });
}
