import { z } from "zod";

import { db } from "@repo/db/server";

import schema from "../../../packages/db/dist/tables";
import { bitSystems, initBitSystems } from "./lib/bit-systems/bit-systems";
import { Bin, TraceableItem, Warehouse } from "./lib/bit-systems/types";
import { asyncBatch } from "./lib/helpers";
import { initSage, sageQuery } from "./lib/sage/sage";
import { STOCK_TRAN } from "./lib/sage/types";

const main = async () => {
  await initSage();
  await initBitSystems();

  await syncWarehouses();
  await syncLocations();
  await syncTransactions();
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

const movementEnum = z.enum(schema.batchMovementType.enumValues);
type movementType = z.infer<typeof movementEnum>;

async function syncTransactions() {
  const results = await sageQuery<STOCK_TRAN, "TRAN_NUMBER">(
    "STOCK_TRAN",
    "TRAN_NUMBER",
  );

  const components = new Map<
    string,
    {
      batches: {
        batchId: number;
        initialQuantity: number;
        remainingQuantity: number;
      }[];
    }
  >();

  const movements: (typeof schema.batchMovement.$inferInsert)[] = [];

  for (const result of results) {
    if (!components.has(result.STOCK_CODE)) {
      components.set(result.STOCK_CODE, {
        batches: [],
      });
    }
    const component = components.get(result.STOCK_CODE)!;

    let type: movementType;

    const reference = result.REFERENCE.toLowerCase();
    const details = result.DETAILS.toLowerCase();

    if (
      result.TYPE.startsWith("M") ||
      reference === "bom out (pss)" ||
      reference === "bom in (pss)" ||
      reference.includes("build")
    ) {
      type = "production";
    } else if (result.TYPE === "GI" || details.startsWith("goods in")) {
      type = "receipt";
    } else if (result.TYPE === "GO" || details.startsWith("goods out")) {
      type = "despatch";
    } else if (result.TYPE === "GR" || details.startsWith("goods return")) {
      type = "receipt";
    } else {
      type = "correction";
    }

    if (result.QUANTITY > 0 && type !== "correction") {
      const { batchId } = (
        await db
          .insert(schema.batch)
          .values({
            componentId: result.STOCK_CODE,
            batchReference: "",
            entryDate: new Date(result.DATE),
          })
          .returning({ batchId: schema.batch.id })
      )[0]!;

      component.batches.push({
        batchId,
        initialQuantity: result.QUANTITY,
        remainingQuantity: result.QUANTITY,
      });

      movements.push({
        batchId,
        quantity: result.QUANTITY,
        type,
        date: new Date(result.DATE),
        locationId: 1,
        userId: "1",
      });
    } else if (result.QUANTITY > 0) {
      let remainingQuantity = result.QUANTITY;
      for (const batch of component.batches) {
        if (remainingQuantity <= 0) break;

        if (batch.remainingQuantity >= 0) continue;

        const usedQuantity = Math.min(
          -batch.remainingQuantity,
          remainingQuantity,
        );
        batch.remainingQuantity += usedQuantity;
        remainingQuantity -= usedQuantity;

        movements.push({
          batchId: batch.batchId,
          quantity: usedQuantity,
          type,
          date: new Date(result.DATE),
          locationId: 1,
          userId: "1",
        });
      }

      if (remainingQuantity !== 0) {
        const batch = component.batches[component.batches.length - 1]!;
        batch.remainingQuantity += remainingQuantity;

        movements.push({
          batchId: batch.batchId,
          quantity: remainingQuantity,
          type,
          date: new Date(result.DATE),
          locationId: 1,
          userId: "1",
        });
      }
    } else {
      let remainingQuantity = -result.QUANTITY;
      for (const batch of component.batches) {
        if (remainingQuantity <= 0) break;

        if (batch.remainingQuantity <= 0) continue;

        const usedQuantity = Math.min(
          batch.remainingQuantity,
          remainingQuantity,
        );
        batch.remainingQuantity -= usedQuantity;
        remainingQuantity -= usedQuantity;

        movements.push({
          batchId: batch.batchId,
          quantity: -usedQuantity,
          type,
          date: new Date(result.DATE),
          locationId: 1,
          userId: "1",
        });
      }

      if (remainingQuantity !== 0) {
        const batch = component.batches[component.batches.length - 1]!;
        batch.remainingQuantity -= remainingQuantity;

        movements.push({
          batchId: batch.batchId,
          quantity: -remainingQuantity,
          type,
          date: new Date(result.DATE),
          locationId: 1,
          userId: "1",
        });
      }
    }

    await asyncBatch(movements, async (batch) => {
      await db.insert(schema.batchMovement).values(batch);
    });

    // if (
    //   result.TYPE === "MO" ||
    //   reference === "bom out (pss)" ||
    //   reference.includes("build")
    // ) {
    //   type = "production";
    // } else if (
    //   result.TYPE === "MI" ||
    //   reference === "bom in (pss)" ||
    //   (reference.includes("build") && result.QUANTITY > 0)
    // ) {
    //   type = "production";
    //   const productionJobId = currentId++;

    //   productionJobs.set(productionJobId, {
    //     id: productionJobId,
    //     componentId: result.STOCK_CODE,
    //     quantity: result.QUANTITY,
    //     date: new Date(result.DATE),
    //     subComponents: unmatchedManufacturingOut.map((out) => ({
    //       componentId: out.STOCK_CODE,
    //       quantity: -out.QUANTITY,
    //     })),
    //   });

    //   component._data.transactions.push({
    //     ...result,
    //     _productionJobId: productionJobId,
    //     _type: "production",
    //   });

    //   unmatchedManufacturingOut.forEach((out) => {
    //     const subComponent = components.get(out.STOCK_CODE);
    //     if (!subComponent) {
    //       console.error(`Component not found for item ${out.STOCK_CODE}`);
    //       return;
    //     }

    //     subComponent._data.transactions.push({
    //       ...out,
    //       _productionJobId: productionJobId,
    //       _type: "production",
    //     });
    //   });

    //   unmatchedManufacturingOut = [];
    // } else if (["stk take", "stock take", "stock"].includes(reference)) {
    //   component._data.transactions.push({
    //     ...result,
    //     _type: "correction",
    //   });
    // } else if (type === "GI" || details.startsWith("goods in")) {
    //   component._data.transactions.push({
    //     ...result,
    //     _type: "receipt",
    //   });
    // } else if (type === "GO" || details.startsWith("goods out")) {
    //   component._data.transactions.push({
    //     ...result,
    //     _type: "despatch",
    //   });
    // } else if (type === "GR" || details.startsWith("goods return")) {
    //   component._data.transactions.push({
    //     ...result,
    //     _type: "return",
    //   });
    // } else {
    //   component._data.transactions.push({
    //     ...result,
    //     _type: "unknown",
    //   });
    // }
  }

  // First we need to sort through and set thr ight type on the transactions

  // Next we need to separate those in production jobs

  // Calculate batches based on GI and MI
}

main();
