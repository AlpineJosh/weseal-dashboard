import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";

let db: Database | undefined = undefined;

export async function initBitSystems() {
  const db = await open({
    filename: "./bit-systems.db",
    driver: sqlite3.Database,
  });
}

export function bitSystems(): Database {
  if (!db) {
    throw new Error("Bit Systems DB not initialized");
  }
  return db;
}
