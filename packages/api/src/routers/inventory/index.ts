import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import schema from "@repo/db/schema";

import { datatable } from "../../lib/datatable";
import { publicProcedure } from "../../trpc";
import { batchRouter } from "./batch";
import { locationRouter } from "./location";
import { movementsRouter } from "./movement";
import { ResetHandler } from "./reset/ResetHandler";
import { taskRouter } from "./task";

const quantityOverview = datatable(schema.batchLocationQuantity);

export const inventoryRouter = {
  resetInventory: publicProcedure.mutation(async () => {
    await new ResetHandler().process();
    return { success: true };
  }),
  quantity: publicProcedure
    .input(quantityOverview.inputSchema)
    .query(async ({ input }) => {
      return quantityOverview.query(input);
    }),
  tasks: taskRouter,
  locations: locationRouter,
  movements: movementsRouter,
  batches: batchRouter,
} satisfies TRPCRouterRecord;

export type InventoryRouter = typeof inventoryRouter;
