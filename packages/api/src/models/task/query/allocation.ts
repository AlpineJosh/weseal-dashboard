import { db } from "#db";
import { datatable } from "#lib/datatables";

import { aliasedTable, eq, schema, sql } from "@repo/db";

// Create aliased tables for locations and location groups
const pickLocation = aliasedTable(schema.location, "pick_location");
const putLocation = aliasedTable(schema.location, "put_location");
const pickLocationGroup = aliasedTable(
  schema.locationGroup,
  "pick_location_group",
);
const putLocationGroup = aliasedTable(
  schema.locationGroup,
  "put_location_group",
);

const overview = db
  .select({
    id: schema.taskAllocation.id,
    taskId: schema.taskAllocation.taskId,
    batchId: schema.taskAllocation.batchId,
    batchReference: schema.batch.batchReference,
    componentId: schema.taskAllocation.componentId,
    componentDescription: schema.component.description,
    componentUnit: schema.component.unit,
    // Pick location info
    pickLocationId: schema.taskAllocation.pickLocationId,
    pickLocationName: sql<string>`${pickLocation.name}`.as(
      "pick_location_name",
    ),
    pickLocationGroupId: sql<number>`${pickLocationGroup.id}`.as(
      "pick_location_group_id",
    ),
    pickLocationGroupName: sql<string>`${pickLocationGroup.name}`.as(
      "pick_location_group_name",
    ),
    // Put location info
    putLocationId: schema.taskAllocation.putLocationId,
    putLocationName: sql<string>`${putLocation.name}`.as("put_location_name"),
    putLocationGroupId: sql<number>`${putLocationGroup.id}`.as(
      "put_location_group_id",
    ),
    putLocationGroupName: sql<string>`${putLocationGroup.name}`.as(
      "put_location_group_name",
    ),
    // Other fields
    quantity: schema.taskAllocation.quantity,
    isComplete: schema.taskAllocation.isComplete,
  })
  .from(schema.taskAllocation)
  .leftJoin(schema.batch, eq(schema.taskAllocation.batchId, schema.batch.id))
  .leftJoin(
    schema.component,
    eq(schema.taskAllocation.componentId, schema.component.id),
  )
  // Pick location joins
  .leftJoin(
    pickLocation,
    eq(schema.taskAllocation.pickLocationId, pickLocation.id),
  )
  .leftJoin(pickLocationGroup, eq(pickLocation.groupId, pickLocationGroup.id))
  // Put location joins
  .leftJoin(
    putLocation,
    eq(schema.taskAllocation.putLocationId, putLocation.id),
  )
  .leftJoin(putLocationGroup, eq(putLocation.groupId, putLocationGroup.id))
  .as("overview");

export const taskAllocationQuery = datatable(
  {
    id: "number",
    taskId: "number",
    batchId: "number",
    batchReference: "string",
    componentId: "string",
    componentDescription: "string",
    componentUnit: "string",
    pickLocationId: "number",
    pickLocationName: "string",
    pickLocationGroupId: "number",
    pickLocationGroupName: "string",
    putLocationId: "number",
    putLocationName: "string",
    putLocationGroupId: "number",
    putLocationGroupName: "string",
    quantity: "decimal",
    isComplete: "boolean",
  },
  overview,
);
