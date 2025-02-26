import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { publicProcedure } from "../../trpc";
import { ledgerRouter } from "./ledger";
import overview from "./model";
import { resetInventory } from "./reset/model";

export const uniqueInventorySchema = z.object({
  componentId: z.string(),
  locationId: z.number(),
  batchId: z.number().optional(),
});

export const inventoryRouter = {
  get: publicProcedure.input(uniqueInventorySchema).query(async ({ input }) => {
    return await overview.findFirst({
      filter: {
        componentId: { eq: input.componentId },
        locationId: { eq: input.locationId },
        batchId: { eq: input.batchId },
      },
    });
  }),
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    return overview.findMany(input);
  }),
  ledger: ledgerRouter,
  reset: publicProcedure.mutation(async () => {
    return resetInventory();
  }),
} satisfies TRPCRouterRecord;

export type InventoryRouter = typeof inventoryRouter;
