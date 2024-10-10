import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { publicProcedure } from "../../trpc";
import { batchRouter } from "./batch";
import { locationRouter } from "./location";
import { movementsRouter } from "./movement";
import { resetInventory } from "./reset";
import { taskRouter } from "./task";

export const inventoryRouter = {
  resetInventory: publicProcedure.mutation(async () => {
    await resetInventory();
    return { success: true };
  }),
  tasks: taskRouter,
  locations: locationRouter,
  movements: movementsRouter,
  batches: batchRouter,
} satisfies TRPCRouterRecord;

export type InventoryRouter = typeof inventoryRouter;
