import { Pool, pool } from "odbc";

import { config } from "../config";
import { SyncParameters } from "~/models/types";
import { formatDate } from "../helpers";

let db: Pool | undefined = undefined;

export async function initSage() {
  const connectionString = `DSN=SageLine50v29;UID=${config.connectors.sage.user};PWD=${config.connectors.sage.password};DIR=${config.connectors.sage.file};`;

  db = await pool({
    connectionString,
    initialSize: 1,
    shrink: true,
    maxSize: 12,
  });
}

export function sage() {
  if (!db) {
    throw new Error("Sage DB not initialized");
  }
  return db;
}

export async function sageQuery<T extends Record<string, any>, K extends keyof T & string>(
  table: string,
  idColumn: K,
  parameters?: SyncParameters,
) {
  const results: T[] = [];
  let lastId: T[K] | undefined = undefined;
  while (true) {
    const query: string = `
      SELECT TOP 10000 * FROM ${table}
      ${lastId ? `WHERE ${idColumn} > ${lastId}` : ""}
      ORDER BY ${idColumn}
      ${parameters ? `AND RECORD_MODIFY_DATE BETWEEN '${formatDate(parameters.startDate)}' AND '${formatDate(parameters.endDate)}'` : ""}
    `;
    console.log("querying")

    const result = await sage().query<T>(query);

    results.push(...result);
    console.log(result.length);
    if (result.length < 10000) {
      break;
    }
    console.log("still more");

    lastId = result[result.length - 1]![idColumn];
  }

  return results;
}
