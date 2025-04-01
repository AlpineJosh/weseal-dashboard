import { db } from "#db";

import { schema } from "@repo/db";

export const seedMetadata = async () => {
  await db
    .insert(schema.department)
    .values([
      {
        id: 1,
        name: "Test Department 1",
      },
      {
        id: 2,
        name: "Test Department 2",
      },
      {
        id: 3,
        name: "Test Department 3",
      },
    ])
    .onConflictDoNothing({
      target: schema.department.id,
    });

  await db.insert(schema.componentCategory).values([
    {
      id: 1,
      name: "Test Category 1",
    },
    {
      id: 2,
      name: "Test Category 2",
    },
    {
      id: 3,
      name: "Test Category 3",
    },
  ]);
};
