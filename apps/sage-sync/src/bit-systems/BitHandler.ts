import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Job, scheduleJob } from "node-schedule";
import postgres from "postgres";
import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";

import { bitSystemsSchema } from "@repo/db/bit-systems";

import { config } from "../lib/config";
import { BitTable } from "./BitTable";

export class BitHandler {
  private source: Database | undefined = undefined;
  private target: PostgresJsDatabase<typeof bitSystemsSchema>;

  private jobs: Job[] = [];

  constructor() {
    const client = postgres(config.target.url);
    this.target = drizzle(client, { schema: bitSystemsSchema });
  }

  async start() {
    if (!config.connectors.bitSystems) {
      return;
    }

    this.source = await open({
      filename: config.connectors.bitSystems.file,
      driver: sqlite3.Database,
    });

    const stockItems = new BitTable(
      this.source,
      this.target,
      bitSystemsSchema.stockItem,
      ["pk_StockItem_ID"],
    );
    const binItems = new BitTable(
      this.source,
      this.target,
      bitSystemsSchema.binItem,
      ["pk_BinItem_ID"],
    );
    const bins = new BitTable(this.source, this.target, bitSystemsSchema.bin, [
      "pk_Bin_ID",
    ]);
    const warehouses = new BitTable(
      this.source,
      this.target,
      bitSystemsSchema.warehouse,
      ["pk_Warehouse_ID"],
    );
    const traceableItems = new BitTable(
      this.source,
      this.target,
      bitSystemsSchema.traceableItem,
      ["pk_TraceableItem_ID"],
    );

    const traceableBinItems = new BitTable(
      this.source,
      this.target,
      bitSystemsSchema.traceableBinItem,
      ["pk_TraceableBinItem_ID"],
    );

    this.jobs.push(
      scheduleJob("0 0 * * *", () => {
        stockItems.sync();
        binItems.sync();
        bins.sync();
        warehouses.sync();
        traceableItems.sync();
        traceableBinItems.sync();
      }),
    );
  }

  stop() {
    for (let job of this.jobs) {
      job.cancel();
    }
  }
}
