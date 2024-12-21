<<<<<<< HEAD
import type { IndexColumn, PgUpdateSetSource } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Database } from "sqlite";
import { getTableConfig } from "drizzle-orm/pg-core";

import type { Table } from "@repo/db";
import type { bitSystemsSchema } from "@repo/db/bit-systems";
=======
import {
  getTableConfig,
  IndexColumn,
  PgUpdateSetSource,
} from "drizzle-orm/pg-core";
import type { Database } from "better-sqlite3";

import { Table } from "@repo/db";
>>>>>>> 588f396c57c1fcf58fd36ac99c570aabebe80c29

import { conflictUpdateAllExcept } from "../lib/helpers";
import { target } from "../lib/target";

export class BitTable<T extends Table> {
  private name: string;
  private indexColumns: IndexColumn[];
  private columns: {
    name: string;
    isDate: boolean;
  }[];
  private batchSize: number;
  constructor(
    private source: Database,
    private table: T,
    private indicies: (keyof T["$inferInsert"])[],
  ) {
    const { columns, name } = getTableConfig(table);

    this.name = name;

    this.indexColumns = columns.filter((column) =>
      indicies.includes(column.name),
    );
    if (this.indexColumns.length !== this.indicies.length) {
      console.log("Incorrect index column: %d", this.indicies);
    }

    this.columns = columns.map((column) => ({
      name: column.name,
      isDate: ["date", "datetime", "timestamp"].includes(column.dataType),
    }));

    this.batchSize = Math.floor(10000 / this.columns.length);
  }

  async sync() {
<<<<<<< HEAD
    const results = await this.source
      .all<T["$inferInsert"][]>(`SELECT * FROM ${this.name}`)
      .then((data) =>
        data.map((row) => {
          const insert = { ...row };
          for (const column of this.columns) {
=======
    const stmt = this.source
      .prepare<T["$inferInsert"]>(`SELECT * FROM ${this.name}`)


    const results = stmt 
    .all([])
    .map((row: any) => {
      const insert = { ...row } as T["$inferInsert"];
      for (let column of this.columns) {
>>>>>>> 588f396c57c1fcf58fd36ac99c570aabebe80c29
            if (column.isDate && row[column.name]) {
              insert[column.name] = new Date(
                row[column.name],
              ) as T["$inferInsert"][typeof column.name];
            }
          }

          return insert;
        })
      

    for (let i = 0; i < results.length; i += this.batchSize) {
      const batch = results.slice(i, i + this.batchSize);

      await target
        .insert(this.table)
        .values(batch)
        .onConflictDoUpdate({
          target: this.indexColumns,
          set: conflictUpdateAllExcept(
            this.table,
            this.indicies,
          ) as unknown as PgUpdateSetSource<T>,
        });
    }
  }
}
