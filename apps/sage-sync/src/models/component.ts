import { inArray, sql } from "@repo/db";
import { db } from "@repo/db/server";
import schema from "@repo/db/schema";

import { asyncBatch, buildQuery } from "~/lib/helpers";
import { sage } from "~/lib/sage/sage";
import { STOCK } from "~/lib/sage/types";
import { SyncParameters } from "./types";

export async function syncComponents(parameters?: SyncParameters) {
  const query = buildQuery("SELECT * FROM STOCK", parameters);
  const result = await sage().query<STOCK>(query);

  const components: (typeof schema.component.$inferInsert)[] = [];
  const subcomponents: (typeof schema.subcomponent.$inferInsert)[] = [];

  result.map((row) => {
    components.push({
      id: row.STOCK_CODE,
      description: row.DESCRIPTION,
      categoryId: row.STOCK_CAT,
      unit: row.UNIT_OF_SALE,
      hasSubcomponents: row.HAS_BOM === "Y",
      sageQuantity: row.QTY_IN_STOCK,
      departmentId: row.DEPT_NUMBER,
      createdAt: new Date(row.RECORD_CREATE_DATE),
      lastModified: new Date(row.RECORD_MODIFY_DATE),
    });

    Array.from({ length: 50 })
      .map((_, i) => ({
        id: row[`COMPONENT_CODE_${i}` as keyof STOCK] as string,
        quantity: row[`COMPONENT_QTY_${i}` as keyof STOCK] as number,
      }))
      .filter(
        (subcomponent) =>
          subcomponent.id?.length > 1 &&
          subcomponent.quantity
      )
      .forEach((subcomponent) => {
        subcomponents.push({
          componentId: row.STOCK_CODE,
          subcomponentId: subcomponent.id,
          quantity: subcomponent.quantity,
        });
      });
  });

  await asyncBatch(components, async (batch) => {
    await db
      .insert(schema.component)
      .values(batch)
      .onConflictDoUpdate({
        target: schema.component.id,
        set: {
          description: sql`excluded.description`,
          categoryId: sql`excluded.category_id`,
          unit: sql`excluded.unit`,
          hasSubcomponents: sql`excluded.has_subcomponents`,
          sageQuantity: sql`excluded.sage_quantity`,
          departmentId: sql`excluded.department_id`,
        },
      });

    await db.delete(schema.subcomponent).where(
      inArray(
        schema.subcomponent.componentId,
        batch.map((c) => c.id),
      ),
    );
  });

  await asyncBatch(subcomponents, async (batch) => {
    await db.insert(schema.subcomponent).values(batch);
  });
}
