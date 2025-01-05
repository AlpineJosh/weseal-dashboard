import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@repo/db";

import { db } from "../../../db";
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

const locationOverview = datatable(schema.base.location);

export const locationRouter = {
  get: publicProcedure.input(uniqueLocationInput).query(async ({ input }) => {
    return await db.query.locationOverview.findFirst({
      where: eq(schema.base.locationOverview.id, input.id),
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
        .insert(schema.base.location)
        .values({
          ...input,
        })
        .returning();
    }),
  update: publicProcedure
    .input(updateLocationInput)
    .mutation(async ({ input: { id, ...input } }) => {
      return await db
        .update(schema.base.location)
        .set({
          ...input,
        })
        .where(eq(schema.base.location.id, id))
        .returning();
    }),
  delete: publicProcedure
    .input(uniqueLocationInput)
    .mutation(async ({ input }) => {
      return await db
        .delete(schema.base.location)
        .where(eq(schema.base.location.id, input.id))
        .returning();
    }),

  groups: locationGroupRouter,
  types: locationTypeRouter,
} satisfies TRPCRouterRecord;
