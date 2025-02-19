import { eq, publicSchema, sql } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatables";

const { locationGroup } = publicSchema;

const locationPath = db.$with("location_paths").as(
  db
    .select({
      id: locationGroup.id,
      path: sql<string[]>`ARRAY[${locationGroup.name}]`.as("path"),
      depth: sql<number>`1`.as("depth"),
    })
    .from(locationGroup)
    .where(sql`${locationGroup.parentGroupId} IS NULL`)
    .union(
      db
        .select({
          id: locationGroup.id,
          path: sql<
            string[]
          >`(SELECT path || ${locationGroup.name} FROM location_paths WHERE id = ${locationGroup.parentGroupId})`.as(
            "path",
          ),
          depth: sql<number>`depth + 1`.as("depth"),
        })
        .from(locationGroup)
        .leftJoin(
          sql`location_paths`,
          eq(locationGroup.parentGroupId, sql`location_paths.id`),
        ),
    ),
);

const overview = db
  .with(locationPath)
  .select({
    id: locationGroup.id,
    name: locationGroup.name,
    details: locationGroup.details,
    parentId: locationGroup.parentGroupId,
    path: locationPath.path,
    depth: locationPath.depth,
    lastModified: locationGroup.lastModified,
  })
  .from(locationGroup)
  .leftJoin(locationPath, eq(locationGroup.id, locationPath.id))
  .as("overview");

export default datatable(
  {
    id: "number",
    name: "string",
    details: "string",
    parentId: "number",
    path: "array",
    depth: "number",
    lastModified: "string",
  },
  overview,
);
