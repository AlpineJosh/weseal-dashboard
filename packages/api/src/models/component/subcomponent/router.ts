import type { TRPCRouterRecord } from "@trpc/server";

import { eq, schema } from "@repo/db";

import { db } from "../../../db";
import { publicProcedure } from "../../../trpc";
import overview from "./model";

export const subcomponentRouter = {
  list: publicProcedure.input(overview.$schema).query(async ({ input }) => {
    if (input.filter?.componentId?.eq) {
      const wip = await db.query.component.findFirst({
        where: eq(schema.component.id, `${input.filter.componentId.eq}WIP`),
      });
      const componentId = wip ? wip.id : input.filter.componentId.eq;
      input.filter.componentId.eq = componentId;
    }
    return overview.findMany(input);
  }),
} satisfies TRPCRouterRecord;

export type SubcomponentRouter = typeof subcomponentRouter;
