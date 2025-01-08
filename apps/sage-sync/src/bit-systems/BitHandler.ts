import type { Database } from "better-sqlite3";
import type { Job } from "node-schedule";
import sqlite3 from "better-sqlite3";
import { scheduleJob } from "node-schedule";

import { schema } from "@repo/db";

import { config } from "../lib/config";
import { BitTable } from "./BitTable";

export class BitHandler {
  private source: Database | undefined = undefined;

  private jobs: Job[] = [];

  constructor() {}

  async start() {
    if (!config.connectors.bitSystems) {
      return;
    }

    this.source = new sqlite3(config.connectors.bitSystems.file);

    if (!this.source) throw new Error("Error setting up sqlite connection");

    const stockItems = new BitTable(this.source, schema.bitSystems.stockItem, [
      "pk_StockItem_ID",
    ]);
    const binItems = new BitTable(this.source, schema.bitSystems.binItem, [
      "pk_BinItem_ID",
    ]);
    const bins = new BitTable(this.source, schema.bitSystems.bin, [
      "pk_Bin_ID",
    ]);
    const warehouses = new BitTable(this.source, schema.bitSystems.warehouse, [
      "pk_Warehouse_ID",
    ]);
    const traceableItems = new BitTable(
      this.source,
      schema.bitSystems.traceableItem,
      ["pk_TraceableItem_ID"],
    );

    const traceableBinItems = new BitTable(
      this.source,
      schema.bitSystems.traceableBinItem,
      ["pk_TraceableBinItem_ID"],
    );

    const sync = async () => {
      await stockItems.sync();
      await binItems.sync();
      await bins.sync();
      await warehouses.sync();
      await traceableItems.sync();
      await traceableBinItems.sync();
    };

    this.jobs.push(
      scheduleJob("0 0 * * *", async () => {
        await sync();
      }),
    );

    await sync();
  }

  stop() {
    if (this.source) {
      this.source.close();
    }

    for (const job of this.jobs) {
      job.cancel();
    }
    this.jobs = [];
  }
}
