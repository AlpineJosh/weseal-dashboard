import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Job, scheduleJob } from "node-schedule";
import { Pool, pool } from "odbc";
import postgres from "postgres";

import { sageSchema } from "@repo/db/sage";

import { config } from "../lib/config";
import { SageTable } from "./SageTable";

const CONNECTION_STRING = `DSN=SageLine50v29;UID=${config.connectors.sage.user};PWD=${config.connectors.sage.password};DIR=${config.connectors.sage.file};`;

export class SageHandler {
  private jobs: Job[] = [];

  private source: Pool | undefined = undefined;
  private target: PostgresJsDatabase<typeof sageSchema>;

  constructor() {
    const client = postgres(config.target.url);

    this.target = drizzle(client, { schema: sageSchema });
  }

  async start() {
    this.source = await pool({
      connectionString: CONNECTION_STRING,
      initialSize: 1,
      shrink: true,
      maxSize: 12,
    });

    const components = new SageTable(
      this.source,
      this.target,
      sageSchema.STOCK,
      ["STOCK_CODE"],
    );
    const stockTrans = new SageTable(
      this.source,
      this.target,
      sageSchema.STOCK_TRAN,
      ["TRAN_NUMBER"],
    );
    this.jobs.push(
      scheduleJob(config.syncSchedules.components, () => {
        const date = new Date();
        components.sync(date);
        stockTrans.sync(date);
      }),
    );

    const purchaseLedger = new SageTable(
      this.source,
      this.target,
      sageSchema.PURCHASE_LEDGER,
      ["ACCOUNT_REF"],
    );
    const purchaseOrders = new SageTable(
      this.source,
      this.target,
      sageSchema.PURCHASE_ORDER,
      ["ORDER_NUMBER"],
    );
    const popItems = new SageTable(
      this.source,
      this.target,
      sageSchema.POP_ITEM,
      ["ITEMID"],
    );
    const grnItems = new SageTable(
      this.source,
      this.target,
      sageSchema.GRN_ITEM,
      ["GRN_NUMBER", "ITEM_NUMBER", "ORDER_NUMBER"],
    );
    this.jobs.push(
      scheduleJob(config.syncSchedules.receiving, () => {
        const date = new Date();
        purchaseLedger.sync(date);
        purchaseOrders.sync(date);
        popItems.sync(date);
        grnItems.sync(date);
      }),
    );

    const salesLedger = new SageTable(
      this.source,
      this.target,
      sageSchema.SALES_LEDGER,
      ["ACCOUNT_REF"],
    );
    const salesOrders = new SageTable(
      this.source,
      this.target,
      sageSchema.SALES_ORDER,
      ["ORDER_NUMBER"],
    );
    const sopItems = new SageTable(
      this.source,
      this.target,
      sageSchema.SOP_ITEM,
      ["ITEMID"],
    );
    const gdnItems = new SageTable(
      this.source,
      this.target,
      sageSchema.GDN_ITEM,
      ["GDN_NUMBER", "ITEM_NUMBER", "ORDER_NUMBER"],
    );
    this.jobs.push(
      scheduleJob(config.syncSchedules.despatching, () => {
        const date = new Date();
        salesLedger.sync(date);
        salesOrders.sync(date);
        sopItems.sync(date);
        gdnItems.sync(date);
      }),
    );

    const departments = new SageTable(
      this.source,
      this.target,
      sageSchema.DEPARTMENT,
      ["NUMBER"],
    );
    const stockCategories = new SageTable(
      this.source,
      this.target,
      sageSchema.STOCK_CAT,
      ["NUMBER"],
    );

    this.jobs.push(
      scheduleJob(config.syncSchedules.misc, () => {
        const date = new Date();
        departments.sync(date);
        stockCategories.sync(date);
      }),
    );
  }

  stop() {
    this.jobs.forEach((job) => job.cancel());
    this.jobs = [];
  }
}
