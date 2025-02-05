import { eq, publicSchema, sql } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatables";
import { as } from "../../../lib/datatables/types";

const { locationGroup } = publicSchema;

const locationPath = db.$with("location_paths").as(
  db
    .select({
      id: locationGroup.id,
      path: as(sql<string[]>`ARRAY[${locationGroup.name}]`, "path", "array"),
      depth: as(sql<number>`1`, "depth", "number"),
    })
    .from(locationGroup)
    .where(sql`${locationGroup.parentGroupId} IS NULL`)
    .union(
      db
        .select({
          id: locationGroup.id,
          path: as(
            sql<
              string[]
            >`(SELECT path || ${locationGroup.name} FROM location_paths WHERE id = ${locationGroup.parentGroupId})`,
            "path",
            "array",
          ),
          depth: as(sql<number>`depth + 1`, "depth", "number"),
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

export default datatable(overview);
