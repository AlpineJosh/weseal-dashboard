import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { publicProcedure } from "../../trpc";
import overview from "./model";

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
} satisfies TRPCRouterRecord;

export type InventoryRouter = typeof inventoryRouter;
