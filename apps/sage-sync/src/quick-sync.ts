import { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { pool } from "odbc";
import { z, ZodSchema } from "zod";

import { asc, sql } from "@repo/db";
import { sageSchema } from "@repo/db/sage";
import { db } from "@repo/db/server";

import { config } from "./lib/config";
import { formatDate } from "./lib/helpers";

const connectionString = `DSN=SageLine50v29;UID=${config.connectors.sage.user};PWD=${config.connectors.sage.password};DIR=${config.connectors.sage.file};`;

const odbc = await pool({
  connectionString,
  initialSize: 1,
  shrink: true,
  maxSize: 12,
});

async function sageQuery<
  T extends Record<string, any>,
  K extends keyof T & string,
>(table: string, sortColumn: string, startDate?: Date, max_records?: number) {
  const results: T[] = [];
  let lastId: T[K] | undefined = undefined;
  while (true) {
    const query: string = `
      SELECT TOP ${max_records || 10000} * FROM ${table}
      ${lastId || startDate ? "WHERE" : ""}
      ${[lastId && `${sortColumn} > ${lastId}`, startDate && `${sortColumn} > '${formatDate(startDate)}'`].filter((x) => !!x).join(" AND ")}
      ORDER BY ${sortColumn}
    `;
    console.log("querying");

    const result = await odbc.query<T>(query);

    results.push(...result);
    console.log(result.length);
    if (result.length < 10000) {
      break;
    }

    lastId = result[result.length - 1]![sortColumn];
  }

  return results;
}

export function asyncBatch<T>(
  items: T[],
  fn: (batch: T[]) => Promise<void>,
  batchSize = 100,
) {
  return Promise.all(
    Array.from({ length: Math.ceil(items.length / batchSize) }).map((_, i) =>
      fn(items.slice(i * batchSize, (i + 1) * batchSize)),
    ),
  );
}

export async function syncTable(
  table: PgTable,
  idColumn: PgColumn,
  dateColumn: PgColumn,
) {
  const schema = z.array(createInsertSchema(table));

  let startDate: Date | undefined;
  if (dateColumn) {
    const results = await db
      .select({
        date: dateColumn,
      })
      .from(table)
      .orderBy(asc(dateColumn))
      .limit(1);

    if (results.length !== 0) {
      startDate = results[0]!.date as Date;
    }
  } else {
    db.delete(table);
  }

  const results = await sageQuery(table._.name, dateColumn._.name, startDate);

  const parsed = schema.parse(results);

  await asyncBatch(parsed, async (batch) => {
    await db.insert(table).values(batch);
  });
}

async function main() {
  await syncTable(
    sageSchema.STOCK,
    sageSchema.STOCK.STOCK_CODE,
    sageSchema.STOCK.RECORD_MODIFY_DATE,
  );
}

main();
