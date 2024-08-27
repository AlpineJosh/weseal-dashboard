import { Pool, pool } from "odbc";

import { config } from "../config";

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
