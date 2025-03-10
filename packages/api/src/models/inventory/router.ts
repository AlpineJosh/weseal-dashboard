import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { schema } from "@repo/db";

import { db } from "../../db";
import { decimal } from "../../lib/decimal";
import { publicProcedure } from "../../trpc";
import { ledgerRouter } from "./ledger";
import overview, { adjustInventory, allocateToTask } from "./model";
import { resetInventory } from "./reset/model";

export const uniqueInventorySchema = z.object({
  componentId: z.string(),
  locationId: z.number(),
  batchId: z.number().optional(),
});

const taskItemInput = z.object({
  componentId: z.string(),
  batchId: z.number(),
  pickLocationId: z.number(),
  quantity: decimal(),
});

const createTransferTaskInput = z.object({
  assignedToId: z.string(),
  putLocationId: z.number(),
  items: z.array(taskItemInput),
});

const adjustInventoryInput = z.object({
  componentId: z.string(),
  batchId: z.number().optional(),
  locationId: z.number(),
  quantity: decimal(),
  type: z.enum(["wastage", "lost", "found", "correction"]),
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
  createTransferTask: publicProcedure
    .input(createTransferTaskInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        const tasks = await tx
          .insert(schema.task)
          .values({
            type: "transfer",
            assignedToId: input.assignedToId,
            createdById: ctx.user.id,
          })
          .returning();

        const task = tasks[0];

        if (!task) {
          throw new Error("Failed to create transfer task");
        }

        for (const item of input.items) {
          await allocateToTask(
            tx,
            {
              componentId: item.componentId,
              batchId: item.batchId,
            },
            item.quantity,
            task.id,
            item.pickLocationId,
            input.putLocationId,
          );
        }
      });
    }),
  adjust: publicProcedure
    .input(adjustInventoryInput)
    .mutation(async ({ input, ctx }) => {
      return await db.transaction(async (tx) => {
        await adjustInventory(
          tx,
          {
            componentId: input.componentId,
            batchId: input.batchId,
          },
          input.locationId,
          input.quantity,
          input.type,
          ctx.user.id,
        );
      });
    }),
  ledger: ledgerRouter,
  reset: publicProcedure.mutation(async () => {
    return resetInventory();
  }),
} satisfies TRPCRouterRecord;

export type InventoryRouter = typeof inventoryRouter;
