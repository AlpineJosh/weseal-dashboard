import { sql } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { asyncBatch, buildQuery } from "~/lib/helpers";
import { sage } from "~/lib/sage/sage";
import { DEPARTMENT, STOCK_CAT } from "~/lib/sage/types";
import { SyncParameters } from "./types";

export async function syncDepartments(parameters: SyncParameters) {
  const query = buildQuery("SELECT * FROM DEPARTMENT", parameters);
  const result = await sage().query<DEPARTMENT>(query);

  const departments: (typeof schema.department.$inferInsert)[] = [];

  result.map((row) => {
    if (row.RECORD_DELETED === 1) {
      return;
    }

    departments.push({
      id: row.NUMBER,
      name: row.NAME,
      lastModified: new Date(row.RECORD_MODIFY_DATE),
      createdAt: new Date(row.RECORD_CREATE_DATE),
    });
  });

  await asyncBatch(departments, async (batch) => {
    await db
      .insert(schema.department)
      .values(batch)
      .onConflictDoUpdate({
        target: schema.department.id,
        set: {
          name: sql<string>`excluded.name`,
          lastModified: sql<Date>`excluded.lastModified`,
          createdAt: sql<Date>`excluded.createdAt`,
        },
      });
  });
}

export async function syncStockCategories(parameters: SyncParameters) {
  const query = "SELECT * FROM STOCK_CAT";
  const result = await sage().query<STOCK_CAT>(query);

  const categories: (typeof schema.componentCategory.$inferInsert)[] = [];

  result.map((row) => {
    categories.push({
      id: row.NUMBER,
      name: row.NAME,
    });
  });

  await asyncBatch(categories, async (batch) => {
    await db
      .insert(schema.componentCategory)
      .values(batch)
      .onConflictDoUpdate({
        target: schema.componentCategory.id,
        set: {
          name: sql<string>`excluded.name`,
        },
      });
  });
}
