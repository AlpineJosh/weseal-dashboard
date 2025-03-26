import type { TRPCRouterRecord } from "@trpc/server";

import { eq, schema } from "@repo/db";

import { db } from "../../db";
import { subcomponentQuery } from "../../models/component/query";
import { publicProcedure } from "../../trpc";

export const subcomponentRouter = {
  list: publicProcedure
    .input(subcomponentQuery.$schema)
    .query(async ({ input }) => {
      if (input.filter?.componentId?.eq) {
        const wip = await db.query.component.findFirst({
          where: eq(schema.component.id, `${input.filter.componentId.eq}WIP`),
        });
        const componentId = wip ? wip.id : input.filter.componentId.eq;
        input.filter.componentId.eq = componentId;
      }
      return subcomponentQuery.findMany(input);
    }),
} satisfies TRPCRouterRecord;

export type SubcomponentRouter = typeof subcomponentRouter;
