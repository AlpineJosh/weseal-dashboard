import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { desc } from "@repo/db";
import { sageDb, sageSchema } from "@repo/db/sage";

import { conflictUpdateAllExcept } from "~/lib/helpers";
import { sage } from "~/lib/sage/sage";

const stockSchema = createInsertSchema(sageSchema.STOCK);

export async function syncStock() {
  const results = await sage().query<z.infer<typeof stockSchema>>(
    "SELECT * FROM STOCK",
  );

  const latest = await sageDb
    .select()
    .from(sageSchema.STOCK)
    .orderBy(desc(sageSchema.STOCK.RECORD_MODIFY_DATE))
    .limit(1);

  const latestDate = new Date(latest[0]?.RECORD_MODIFY_DATE ?? "2000-01-01");

  for (const result of results) {
    if (new Date(result.RECORD_MODIFY_DATE!) >= latestDate) {
      await sageDb
        .insert(sageSchema.STOCK)
        .values(result)
        .onConflictDoUpdate({
          target: sageSchema.STOCK.STOCK_CODE,
          set: conflictUpdateAllExcept(sageSchema.STOCK, ["STOCK_CODE"]),
        });
    }
  }
}
