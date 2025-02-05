import { aliasedTable, eq, publicSchema } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatables";

const { taskItem, batch, component, location, locationGroup } = publicSchema;

// Create aliased tables for locations and location groups
const pickLocation = aliasedTable(location, "pick_location");
const putLocation = aliasedTable(location, "put_location");
const pickLocationGroup = aliasedTable(locationGroup, "pick_location_group");
const putLocationGroup = aliasedTable(locationGroup, "put_location_group");

const overview = db
  .select({
    id: taskItem.id,
    taskId: taskItem.taskId,
    batchId: taskItem.batchId,
    batchReference: batch.batchReference,
    componentId: batch.componentId,
    componentDescription: component.description,
    componentUnit: component.unit,
    // Pick location info
    pickLocationId: taskItem.pickLocationId,
    pickLocationName: pickLocation.name,
    pickLocationGroupId: pickLocationGroup.id,
    pickLocationGroupName: pickLocationGroup.name,
    // Put location info
    putLocationId: taskItem.putLocationId,
    putLocationName: putLocation.name,
    putLocationGroupId: putLocationGroup.id,
    putLocationGroupName: putLocationGroup.name,
    // Other fields
    quantity: taskItem.quantity,
    isComplete: taskItem.isComplete,
  })
  .from(taskItem)
  .leftJoin(batch, eq(taskItem.batchId, batch.id))
  .leftJoin(component, eq(batch.componentId, component.id))
  // Pick location joins
  .leftJoin(pickLocation, eq(taskItem.pickLocationId, pickLocation.id))
  .leftJoin(pickLocationGroup, eq(pickLocation.groupId, pickLocationGroup.id))
  // Put location joins
  .leftJoin(putLocation, eq(taskItem.putLocationId, putLocation.id))
  .leftJoin(putLocationGroup, eq(putLocation.groupId, putLocationGroup.id))
  .as("overview");

export default datatable(overview);
