import type Decimal from "decimal.js";

import type { SQL, SQLChunk } from "@repo/db";
import { sql, StringChunk } from "@repo/db";

export const coalesce = (...values: SQLChunk[]): SQL<Decimal> => {
  return sql<Decimal>`coalesce(${sql.join(values, new StringChunk(", "))})`;
};
