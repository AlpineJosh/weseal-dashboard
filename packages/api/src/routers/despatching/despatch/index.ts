import { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";
import { salesDespatchItemRouter } from "./item";

const uniqueDespatchInput = z.object({
  id: z.number(),
});

const despatchOverview = datatable(schema.salesDespatchOverview);

export const salesDespatchRouter = {
  get: publicProcedure.input(uniqueDespatchInput).query(async ({ input }) => {
    return db.query.salesDespatchOverview.findFirst({
      where: eq(schema.salesDespatchOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(despatchOverview.inputSchema)
    .query(async ({ input }) => {
      return await despatchOverview.query(input);
    }),
  items: salesDespatchItemRouter,
} satisfies TRPCRouterRecord;
