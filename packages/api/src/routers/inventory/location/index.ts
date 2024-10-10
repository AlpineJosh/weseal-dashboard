import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { count, eq } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import { datatable } from "../../../lib/datatable";
import { publicProcedure } from "../../../trpc";
import { locationGroupRouter } from "./group";
import { locationTypeRouter } from "./type";

const uniqueLocationInput = z.object({
  id: z.number(),
});

const createLocationInput = z.object({
  name: z.string(),
  typeId: z.number(),
  groupId: z.number(),
});

const updateLocationInput = uniqueLocationInput.merge(createLocationInput);

const locationOverview = datatable(schema.locationOverview);

export const locationRouter = {
  get: publicProcedure.input(uniqueLocationInput).query(async ({ input }) => {
    return await db.query.locationOverview.findFirst({
      where: eq(schema.locationOverview.id, input.id),
    });
  }),
  list: publicProcedure
    .input(locationOverview.inputSchema)
    .query(async ({ input }) => {
      return await locationOverview.query(input);
    }),
  create: publicProcedure
    .input(createLocationInput)
    .mutation(async ({ input }) => {
      return await db
        .insert(schema.location)
        .values({
          ...input,
        })
        .returning();
    }),
  update: publicProcedure
    .input(updateLocationInput)
    .mutation(async ({ input: { id, ...input } }) => {
      return await db
        .update(schema.location)
        .set({
          ...input,
        })
        .where(eq(schema.location.id, id))
        .returning();
    }),
  delete: publicProcedure
    .input(uniqueLocationInput)
    .mutation(async ({ input }) => {
      return await db
        .delete(schema.location)
        .where(eq(schema.location.id, input.id))
        .returning();
    }),

  groups: locationGroupRouter,
  types: locationTypeRouter,
} satisfies TRPCRouterRecord;
