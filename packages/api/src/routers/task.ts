import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { count, eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { paginationSchema, sortSchema } from "../lib/schemas";
import { publicProcedure } from "../trpc";

const uniqueTaskInput = z.object({
  id: z.number(),
});

const listTaskInput = z.object({
  pagination: paginationSchema(),
  filter: z
    .object({
      type: z.enum(["transfer", "production", "despatch", "receipt"]),
    })
    .optional(),
  sort: sortSchema(["createdAt"]),
});

const createTaskInput = z.object({
  assignedToId: z.string(),
  productionJobId: z.number().optional(),
  purchaseOrderId: z.number().optional(),
  salesOrderId: z.number().optional(),
  type: z.enum(["transfer", "production", "despatch", "receipt"]),
  items: z.array(
    z.object({
      componentId: z.string(),
      locationId: z.number(),
      batchId: z.number(),
      quantity: z.number(),
    }),
  ),
});

export const taskRouter = {
  get: publicProcedure.input(uniqueTaskInput).query(async ({ input }) => {
    return await db.query.task.findFirst({
      where: eq(schema.task.id, input.id),
      with: {
        productionJob: true,
        salesDespatch: true,
        items: {
          with: {
            pickLocation: true,
            putLocation: true,
            batch: {
              with: {
                component: true,
              },
            },
          },
        },
      },
    });
  }),
  list: publicProcedure.input(listTaskInput).query(async ({ input }) => {
    const total = await db.select({ count: count() }).from(schema.task);

    const results = await db.query.task.findMany({
      limit: input.pagination.size,
      offset: (input.pagination.page - 1) * input.pagination.size,
      with: {
        productionJob: true,
        salesDespatch: true,
        items: true,
      },
    });

    return {
      rows: results,
      pagination: {
        page: input.pagination.page,
        size: input.pagination.size,
        total: total[0]?.count ?? 0,
      },
      sort: input.sort ?? [],
    };
  }),
  create: publicProcedure.input(createTaskInput).mutation(async ({ input }) => {
    const result = await db
      .insert(schema.task)
      .values({
        ...input,
        createdById: "",
      })
      .returning();
    const task = result[0]!;

    const taskItems = await db
      .insert(schema.taskItem)
      .values(
        input.items.map((item) => ({
          ...item,
          taskId: task.id,
        })),
      )
      .returning();

    return { ...task, items: taskItems };
  }),
  completeItem: publicProcedure
    .input(uniqueTaskInput)
    .mutation(async ({ input }) => {
      return await db
        .update(schema.taskItem)
        .set({
          isComplete: true,
        })
        .where(eq(schema.taskItem.id, input.id))
        .returning();
    }),
  delete: publicProcedure.input(uniqueTaskInput).mutation(async ({ input }) => {
    return await db
      .delete(schema.task)
      .where(eq(schema.task.id, input.id))
      .returning();
  }),
} satisfies TRPCRouterRecord;
