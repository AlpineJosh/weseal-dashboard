import schema from "@repo/db/schema";
import { db } from "@repo/db/server";

import { bitSystems, initBitSystems } from "./lib/bit-systems/bit-systems";
import { Bin, TraceableItem, Warehouse } from "./lib/bit-systems/types";
import { initSage } from "./lib/sage/sage";

const main = async () => {
  await initSage();
  await initBitSystems();

  await syncWarehouses();
  await syncLocations();
};

async function syncWarehouses() {
  const result = await bitSystems().all<Warehouse[]>(
    "SELECT * FROM Warehouses",
  );

  await db.insert(schema.locationGroup).values(
    result.map((warehouse) => ({
      id: warehouse.pk_Warehouse_ID,
      name: warehouse.Name,
      details: warehouse.Description,
    })),
  );
}

async function syncLocations() {
  const result = await bitSystems().all<Bin[]>("SELECT * FROM Bins");

  await db.insert(schema.location).values(
    result.map((bin) => ({
      id: bin.pk_Bin_ID,
      name: bin.Name,
      groupId: bin.fk_Warehouse_ID,
      typeId: 1,
    })),
  );
}

main();
