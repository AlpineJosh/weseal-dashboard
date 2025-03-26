import { z } from "zod";

import type { TRPCRouterRecord } from "@trpc/server";
import {
  adjustInventory,
  createTransferTask,
} from "@/models/inventory/inventory";
import { inventoryQuery } from "@/models/inventory/query";
import { db } from "../../db";
import { decimal } from "../../lib/decimal";
import { resetInventory } from "../../models/reset/model";
import { publicProcedure } from "../../trpc";
import { ledgerRouter } from "./ledger";

export const uniqueInventorySchema = z.object({
  componentId: z.string(),
  locationId: z.number(),
  batchId: z.number().optional(),
});

const taskAllocationInput = z.object({
  reference: z.object({
    componentId: z.string(),
    batchId: z.number().nullable(),
  }),
  pickLocationId: z.number(),
  putLocationId: z.number(),
  quantity: decimal(),
});

const createTransferTaskInput = z.object({
  assignedToId: z.string(),
  putLocationId: z.number(),
  allocations: z.array(taskAllocationInput),
});

const adjustInventoryInput = z.object({
  reference: z.object({
    componentId: z.string(),
    batchId: z.number().nullable(),
  }),
  locationId: z.number(),
  quantity: decimal(),
  type: z.enum(["wastage", "lost", "found", "correction"]),
});

export const inventoryRouter = {
  get: publicProcedure.input(uniqueInventorySchema).query(async ({ input }) => {
    return await inventoryQuery.findFirst({
      filter: {
        componentId: { eq: input.componentId },
        locationId: { eq: input.locationId },
        batchId: { eq: input.batchId },
      },
    });
  }),
  list: publicProcedure
    .input(inventoryQuery.$schema)
    .query(async ({ input }) => {
      return inventoryQuery.findMany(input);
    }),
  createTransferTask: publicProcedure
    .input(createTransferTaskInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        await createTransferTask(tx, {
          ...input,
          createdById: ctx.user.id,
        });
      });
    }),
  adjust: publicProcedure
    .input(adjustInventoryInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        await adjustInventory(tx, {
          reference: input.reference,
          locationId: input.locationId,
          quantity: input.quantity,
          type: input.type,
          userId: ctx.user.id,
        });
      });
    }),
  ledger: ledgerRouter,
  reset: publicProcedure.mutation(async () => {
    return resetInventory();
  }),
} satisfies TRPCRouterRecord;

export type InventoryRouter = typeof inventoryRouter;
