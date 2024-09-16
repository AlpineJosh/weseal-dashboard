import type { TRPCRouterRecord } from "@trpc/server";

import { publicProcedure } from "../../trpc";
import { resetInventory } from "./reset";

export const inventoryRouter = {
  resetInventory: publicProcedure.mutation(async () => {
    await resetInventory();
    return { success: true };
  }),
} satisfies TRPCRouterRecord;

export type InventoryRouter = typeof inventoryRouter;
