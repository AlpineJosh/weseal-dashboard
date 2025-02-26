import { eq, schema, sql } from "@repo/db";

import { db } from "../../../db";
import { datatable } from "../../../lib/datatables";

const overview = db
  .select({
    id: schema.inventoryLedger.id,
    date: schema.inventoryLedger.createdAt,
    componentId: schema.inventoryLedger.componentId,
    componentDescription: sql`${schema.component.description}`.as(
      "component_description",
    ),
    componentUnit: sql`${schema.component.unit}`.as("component_unit"),
    batchId: schema.inventoryLedger.batchId,
    batchReference: sql`${schema.batch.batchReference}`.as("batch_reference"),
    locationId: schema.inventoryLedger.locationId,
    locationName: sql`${schema.location.name}`.as("location_name"),
    quantity: schema.inventoryLedger.quantity,
    type: schema.inventoryLedger.type,
    userId: schema.inventoryLedger.userId,
    userName: sql`${schema.profile.name}`.as("user_name"),
  })
  .from(schema.inventoryLedger)
  .leftJoin(
    schema.component,
    eq(schema.inventoryLedger.componentId, schema.component.id),
  )
  .leftJoin(
    schema.location,
    eq(schema.inventoryLedger.locationId, schema.location.id),
  )
  .leftJoin(schema.batch, eq(schema.inventoryLedger.batchId, schema.batch.id))
  .leftJoin(
    schema.profile,
    eq(schema.inventoryLedger.userId, schema.profile.id),
  )
  .as("overview");

export default datatable(
  {
    id: "number",
    date: "date",
    componentId: "string",
    componentDescription: "string",
    componentUnit: "string",
    batchId: "number",
    batchReference: "string",
    locationId: "number",
    locationName: "string",
    quantity: "decimal",
    type: "string",
    userId: "string",
    userName: "string",
  },
  overview,
);
