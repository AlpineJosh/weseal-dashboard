import { AnyRouter } from "@trpc/server";
import { z } from "zod";

import { db } from "@repo/db/client";
import { task } from "@repo/db/schema/stock";

import { createTRPCRouter, publicProcedure } from "../trpc";

const taskInput = z.object({
  assignedToId: z.string(),
  productionJobId: z.number().optional(),
  purchaseOrderId: z.number().optional(),
  salesOrderId: z.number().optional(),
  type: z.enum(["shipment", "return", "transfer", "production", "adjustment"]),
});

export const taskRouter: AnyRouter = createTRPCRouter({
  get: publicProcedure.query(() => {
    return "Hello World";
  }),
  create: publicProcedure.input(taskInput).mutation(async ({ input }) => {
    const t = await db.insert(task).values({
      ...input,
      createdById: "",
    });
    return t;
  }),
});
