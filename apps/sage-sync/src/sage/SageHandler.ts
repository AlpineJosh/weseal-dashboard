import { Job, scheduleJob } from "node-schedule";
import { Pool, pool } from "odbc";

import { schema } from "@repo/db";

import { config } from "../lib/config";
import { SageTable } from "./SageTable";

const CONNECTION_STRING = `DSN=SageLine50v29;UID=${config.connectors.sage.user};PWD=${config.connectors.sage.password};DIR=${config.connectors.sage.file};`;

export class SageHandler {
  private jobs: Job[] = [];

  private source: Pool | undefined = undefined;

  constructor() {
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
      schema.sage.STOCK,
      ["STOCK_CODE"],
    );
    const stockTrans = new SageTable(
      this.source,
      schema.sage.STOCK_TRAN,
      ["TRAN_NUMBER"],
    );
    this.jobs.push(
      scheduleJob(config.syncSchedules.components, async () => {
        const date = new Date();
        await components.sync(date);
        await stockTrans.sync(date);
      }),
    );

    const purchaseLedger = new SageTable(
      this.source,
      schema.sage.PURCHASE_LEDGER,
      ["ACCOUNT_REF"],
    );
    const purchaseOrders = new SageTable(
      this.source,
      schema.sage.PURCHASE_ORDER,
      ["ORDER_NUMBER"],
    );
    const popItems = new SageTable(
      this.source,
      schema.sage.POP_ITEM,
      ["ITEMID"],
    );
    const grnItems = new SageTable(
      this.source,
      schema.sage.GRN_ITEM,
      ["GRN_NUMBER", "ITEM_NUMBER", "ORDER_NUMBER"],
    );
    this.jobs.push(
      scheduleJob(config.syncSchedules.receiving, async () => {
        const date = new Date();
        await purchaseLedger.sync(date);
        await purchaseOrders.sync(date);
        await popItems.sync(date);
        await grnItems.sync(date);
      }),
    );

    const salesLedger = new SageTable(
      this.source,
      schema.sage.SALES_LEDGER,
      ["ACCOUNT_REF"],
    );
    const salesOrders = new SageTable(
      this.source,
      schema.sage.SALES_ORDER,
      ["ORDER_NUMBER"],
    );
    const sopItems = new SageTable(
      this.source,
      schema.sage.SOP_ITEM,
      ["ITEMID"],
    );
    const gdnItems = new SageTable(
      this.source,
      schema.sage.GDN_ITEM,
      ["GDN_NUMBER", "ITEM_NUMBER", "ORDER_NUMBER"],
    );
    this.jobs.push(
      scheduleJob(config.syncSchedules.despatching, async () => {
        const date = new Date();
        await salesLedger.sync(date);
        await salesOrders.sync(date);
        await sopItems.sync(date);
        await gdnItems.sync(date);
      }),
    );

    const departments = new SageTable(
      this.source,
      schema.sage.DEPARTMENT,
      ["NUMBER"],
    );
    const stockCategories = new SageTable(
      this.source,
      schema.sage.STOCK_CAT,
      ["NUMBER"],
    );

    this.jobs.push(
      scheduleJob(config.syncSchedules.misc, async () => {
        const date = new Date();
        await departments.sync(date);
        await stockCategories.sync(date);
      }),
    );
  }

  stop() {
    this.jobs.forEach((job) => job.cancel());
    this.jobs = [];
  }
}
