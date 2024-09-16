import type { TRPCRouterRecord } from "@trpc/server";

import { db } from "@repo/db/client";

import { publicProcedure } from "../../trpc";
import { resetInventory } from "./reset";

export const inventoryRouter = {
  resetInventory: publicProcedure.mutation(async () => {
    await resetInventory();
    return { success: true };
  }),
  locations: publicProcedure.query(async () => {
    return await db.query.location.findMany();
  }),
} satisfies TRPCRouterRecord;

export type InventoryRouter = typeof inventoryRouter;
