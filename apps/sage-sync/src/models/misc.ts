import { sql } from "@repo/db";
import { db } from "@repo/db/server";

import { asyncBatch, buildQuery } from "~/lib/helpers";
import { sage } from "~/lib/sage/sage";
import { DEPARTMENT, STOCK_CAT } from "~/lib/sage/types";
import schema from "../../../../packages/db/dist/tables";
import { SyncParameters } from "./types";

export async function syncDepartments(parameters?: SyncParameters) {
  const query = buildQuery("SELECT * FROM DEPARTMENT", parameters);
  const result = await sage().query<DEPARTMENT>(query);

  const departments: (typeof schema.department.$inferInsert)[] = [];

  result.map((row) => {
    departments.push({
      id: row.NUMBER,
      name: row.NAME,
      lastModified: new Date(row.RECORD_MODIFY_DATE),
      createdAt: new Date(row.RECORD_CREATE_DATE),
      isDeleted: row.RECORD_DELETED === 1,
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
          lastModified: sql<Date>`excluded.last_modified`,
          createdAt: sql<Date>`excluded.created_at`,
          isDeleted: sql<boolean>`excluded.is_deleted`,
        },
      });
  });
}

export async function syncStockCategories(_?: SyncParameters) {
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
