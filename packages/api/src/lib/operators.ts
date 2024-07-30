
import { sql, SQLChunk, StringChunk } from "@repo/db";

export const coalesce = (...values: SQLChunk[]) => {
  return sql`coalesce(${sql.join(values, new StringChunk(", "))})`;
};