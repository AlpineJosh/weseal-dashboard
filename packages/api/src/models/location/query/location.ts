import { db } from "#db";
import { datatable } from "#lib/datatables";

import { eq, publicSchema, sql } from "@repo/db";

const { location, locationGroup, locationType } = publicSchema;

const overview = db
  .select({
    id: location.id,
    name: location.name,
    details: location.details,
    groupId: location.groupId,
    groupName: sql<string>`${locationGroup.name}`.as("group_name"),
    typeId: location.typeId,
    typeName: sql<string>`${locationType.name}`.as("type_name"),
    isPickable: locationType.isPickable,
    isTransient: locationType.isTransient,
  })
  .from(location)
  .leftJoin(locationGroup, eq(location.groupId, locationGroup.id))
  .leftJoin(locationType, eq(location.typeId, locationType.id))
  .as("overview");

export const locationQuery = datatable(
  {
    id: "number",
    name: "string",
    details: "string",
    groupId: "number",
    groupName: "string",
    typeId: "number",
    typeName: "string",
    isPickable: "boolean",
    isTransient: "boolean",
  },
  overview,
);
