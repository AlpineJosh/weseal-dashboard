import type {
  IndexColumn,
  PgTable,
  PgUpdateSetSource,
} from "drizzle-orm/pg-core";
import { getTableConfig } from "drizzle-orm/pg-core";

import { Pool } from "odbc";

import { AnyColumn, desc, isNotNull } from "@repo/db";

import {
  asyncBatch,
  conflictUpdateAllExcept,
  formatDate,
} from "../lib/helpers";
import { target } from "../lib/target";

export class SageTable<T extends PgTable> {
  name: string;

  lastModifiedColumn: AnyColumn;
  indexColumns: IndexColumn[];
  columns: {
    name: keyof T["$inferInsert"];
    isDate: boolean;
  }[];

  batchSize: number;

  constructor(
    private source: Pool,
    private table: T,
    private indicies: (keyof T["$inferInsert"])[],
  ) {
    const config = getTableConfig(table);

    this.name = config.name;

    this.lastModifiedColumn = config.columns.find(
      (column) => column.name === "RECORD_MODIFY_DATE",
    ) as AnyColumn;

    this.indexColumns = config.columns.filter((column) =>
      indicies.includes(column.name as keyof T["$inferInsert"]),
    ) as IndexColumn[];

    if (this.indexColumns.length !== indicies.length) {
      console.log("Incorrect index column: %d", indicies);
    }

    this.columns = config.columns.map((column) => ({
      name: column.name as keyof T["$inferInsert"],
      isDate: ["date", "datetime", "timestamp"].includes(column.dataType),
    }));

    this.batchSize = Math.floor(10000 / this.columns.length);
  }

  private async getLatestDate() {
    let latest: Date = new Date("2000-01-01");

    if (this.lastModifiedColumn) {
      const latestDates = await target
      .select()
      .from(this.table)
      .where(isNotNull(this.lastModifiedColumn))
      .orderBy(desc(this.lastModifiedColumn))
      .limit(1);
      
      if (latestDates[0]?.RECORD_MODIFY_DATE) {
        latest = new Date(latestDates[0]?.RECORD_MODIFY_DATE as string);
      }
    }

    return latest;
  }

  async sync(endDate: Date) {
    
    const latestDate = await this.getLatestDate();

    if (latestDate && latestDate >= endDate) {
      return;
    }

    let query = `SELECT * FROM "${this.name}" `;
    if (latestDate) {
      query += `WHERE "RECORD_MODIFY_DATE" > '${formatDate(latestDate)}'`;
    }

    const results = await this.source
      .query<T["$inferInsert"]>(query)
      .then((data) =>
        data.map((row) => {
          const insert = { ...row };
          for (const column of this.columns) {
            if (column.isDate && insert[column.name]) {
              insert[column.name] = new Date(
                row[column.name] as string,
              ) as T["$inferInsert"][typeof column.name];
            }
          }
          return insert;
        }),
      );

    await asyncBatch(
      results,
      async (batch) => {
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
      },
      this.batchSize,
    );
  }
}
