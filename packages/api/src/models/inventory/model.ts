import { eq, publicSchema } from "@repo/db";

import { db } from "../../db";
import { datatable } from "../../lib/datatables";

const { inventory, component, location, batch } = publicSchema;

const overview = db
  .select({
    componentId: inventory.componentId,
    componentDescription: component.description,
    componentUnit: component.unit,
    isStockTracked: component.isStockTracked,
    isBatchTracked: component.isBatchTracked,
    batchId: inventory.batchId,
    batchReference: batch.batchReference,
    entryDate: inventory.entryDate,
    locationId: inventory.locationId,
    locationName: location.name,
    totalQuantity: inventory.totalQuantity,
    allocatedQuantity: inventory.allocatedQuantity,
    freeQuantity: inventory.freeQuantity,
  })
  .from(inventory)
  .leftJoin(component, eq(inventory.componentId, component.id))
  .leftJoin(location, eq(inventory.locationId, location.id))
  .leftJoin(batch, eq(inventory.batchId, batch.id))
  .as("overview");

export default datatable(overview);
