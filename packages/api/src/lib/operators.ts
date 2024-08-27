import type { SQLChunk } from "@repo/db";
import { sql, StringChunk } from "@repo/db";

export const coalesce = (...values: SQLChunk[]) => {
  return sql<number>`coalesce(${sql.join(values, new StringChunk(", "))})`;
};
