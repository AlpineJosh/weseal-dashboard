import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { count, ilike } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { publicProcedure } from "../../trpc";
import { resetInventory } from "./reset";

export const inventoryRouter = {
  resetInventory: publicProcedure.mutation(async () => {
    await resetInventory();
    return { success: true };
  }),
  locations: publicProcedure
    .input(
      z.object({
        filter: z.object({
          search: z.string().optional(),
        }),
      }),
    )
    .query(async ({ input }) => {
      const where = ilike(schema.location.name, `%${input.filter.search}%`);
      const total = await db
        .select({ count: count() })
        .from(schema.location)
        .where(where);
      const data = await db.query.location.findMany({
        limit: 10,
        offset: 0,
        where,
        with: {
          group: true,
        },
      });
      return {
        pagination: {
          total,
          page: 1,
          pageSize: 10,
        },
        rows: data,
        sort: [],
      };
    }),
} satisfies TRPCRouterRecord;

export type InventoryRouter = typeof inventoryRouter;
