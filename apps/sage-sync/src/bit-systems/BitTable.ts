import type { IndexColumn, PgUpdateSetSource } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Database } from "sqlite";
import { getTableConfig } from "drizzle-orm/pg-core";

import type { Table } from "@repo/db";
import type { bitSystemsSchema } from "@repo/db/bit-systems";

import { conflictUpdateAllExcept } from "../lib/helpers";

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
    private target: PostgresJsDatabase<typeof bitSystemsSchema>,
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
    const results = await this.source
      .all<T["$inferInsert"][]>(`SELECT * FROM ${this.name}`)
      .then((data) =>
        data.map((row) => {
          const insert = { ...row };
          for (const column of this.columns) {
            if (column.isDate && row[column.name]) {
              insert[column.name] = new Date(
                row[column.name],
              ) as T["$inferInsert"][typeof column.name];
            }
          }

          return insert;
        }),
      );

    for (let i = 0; i < results.length; i += this.batchSize) {
      const batch = results.slice(i, i + this.batchSize);

      await this.target
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
