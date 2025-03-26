import type { Transaction } from "#db";

import { eq, schema } from "@repo/db";

export const getSubcomponents = async (
  tx: Transaction,
  componentId: string,
) => {
  const wip = await tx.query.component.findFirst({
    where: eq(schema.component.id, `${componentId}WIP`),
  });

  componentId = wip ? wip.id : componentId;

  return tx.query.subcomponent.findMany({
    where: eq(schema.subcomponent.componentId, componentId),
  });
};
