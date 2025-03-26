// import Decimal from "decimal.js";

// import type { Schema } from "@repo/db";
// import { and, asc, desc, eq, gt, schema, sql, sum } from "@repo/db";

// import type { Transaction } from "../../db";
// import { db } from "../../db";
// import { datatable } from "../../lib/datatables";

// Decimal.set({ precision: 15, rounding: Decimal.ROUND_HALF_UP });

// export interface InventoryReference {
//   componentId: string;
//   batchId?: number;
// }

// export interface LedgerEntryDetails {
//   userId: string;
//   type: Schema["transactionType"]["enumValues"][number];
//   salesDespatchItemId?: number;
//   productionJobAllocationId?: number;
// }

// export interface InventoryEntry {
//   componentId: string;
//   batchId?: number;
//   locationId: number;
//   quantity: Decimal;
//   lots: {
//     id: number;
//     quantity: Decimal;
//   }[];
// }

// export const fetchLotInventory = async (
//   tx: Transaction,
//   reference: InventoryReference,
//   locationId: number,
//   priority: "oldest" | "newest" = "oldest",
// ) => {
//   return await tx
//     .select({
//       id: schema.inventoryLot.componentLotId,
//       componentId: schema.componentLot.componentId,
//       batchId: schema.componentLot.batchId,
//       entryDate: schema.componentLot.entryDate,
//       quantity: schema.inventoryLot.freeQuantity,
//       locationId: schema.inventoryLot.locationId,
//     })
//     .from(schema.inventoryLot)
//     .leftJoin(
//       schema.componentLot,
//       eq(schema.inventoryLot.componentLotId, schema.componentLot.id),
//     )
//     .where(
//       and(
//         eq(schema.inventoryLot.locationId, locationId),
//         eq(schema.componentLot.componentId, reference.componentId),
//         gt(schema.inventoryLot.freeQuantity, new Decimal(0)),
//         reference.batchId
//           ? eq(schema.componentLot.batchId, reference.batchId)
//           : undefined,
//       ),
//     )
//     .orderBy(
//       priority === "oldest"
//         ? asc(schema.componentLot.entryDate)
//         : desc(schema.componentLot.entryDate),
//     );
// };

// export const calculateOutboundEntry = async (
//   tx: Transaction,
//   reference: InventoryReference,
//   locationId: number,
//   quantity: Decimal,
// ): Promise<InventoryEntry> => {
//   if (quantity.lte(0)) {
//     throw new Error("Quantity must be greater than 0");
//   }

//   const lots = await fetchLotInventory(tx, reference, locationId, "oldest");

//   let remainingQuantity = quantity;

//   const assignedLots: { id: number; quantity: Decimal }[] = [];

//   for (const lot of lots) {
//     if (lot.quantity.isZero()) {
//       continue;
//     }

//     assignedLots.push({
//       id: lot.id,
//       quantity: Decimal.min(lot.quantity, remainingQuantity),
//     });

//     remainingQuantity = remainingQuantity.sub(lot.quantity);
//     if (remainingQuantity.lte(0)) {
//       break;
//     }
//   }

//   if (remainingQuantity.gt(0)) {
//     throw new Error("Not enough lots to assign");
//   }

//   return {
//     componentId: reference.componentId,
//     batchId: reference.batchId,
//     locationId,
//     quantity: quantity,
//     lots: assignedLots,
//   };
// };

// export const createInboundEntry = async (
//   tx: Transaction,
//   reference: InventoryReference,
//   locationId: number,
//   quantity: Decimal,
//   entryDate: Date,
//   purchaseReceiptItemId?: number,
//   productionJobId?: number,
// ): Promise<InventoryEntry> => {
//   const lots = await tx
//     .insert(schema.componentLot)
//     .values([
//       {
//         componentId: reference.componentId,
//         batchId: reference.batchId,
//         entryDate,
//         purchaseReceiptItemId,
//         productionJobId,
//       },
//     ])
//     .returning({
//       id: schema.componentLot.id,
//       componentId: schema.componentLot.componentId,
//       batchId: schema.componentLot.batchId,
//     });

//   const lot = lots[0];

//   if (!lot) {
//     throw new Error("Failed to create lot");
//   }

//   return {
//     componentId: reference.componentId,
//     batchId: reference.batchId,
//     locationId,
//     quantity: quantity,
//     lots: [{ id: lot.id, quantity: quantity }],
//   };
// };

// export const assignInboundEntry = async (
//   tx: Transaction,
//   reference: InventoryReference,
//   locationId: number,
//   quantity: Decimal,
//   entryDate?: Date,
// ): Promise<InventoryEntry> => {
//   if (quantity.lte(0)) {
//     throw new Error("Quantity must be greater than 0");
//   }

//   const lots = await fetchLotInventory(tx, reference, locationId, "newest");

//   const lot = lots[0];

//   if (!lot) {
//     return await createInboundEntry(
//       tx,
//       reference,
//       locationId,
//       quantity,
//       entryDate ?? new Date(),
//     );
//   }

//   return {
//     componentId: reference.componentId,
//     batchId: reference.batchId,
//     locationId,
//     quantity,
//     lots: [{ id: lot.id, quantity: quantity }],
//   };
// };

// export const logToLedger = async (
//   tx: Transaction,
//   direction: "inbound" | "outbound",
//   entry: InventoryEntry,
//   details: LedgerEntryDetails,
// ) => {
//   const promises = [];

//   promises.push(
//     tx.insert(schema.inventoryLotLedger).values(
//       entry.lots.map((lot) => ({
//         componentLotId: lot.id,
//         quantity:
//           direction === "inbound" ? lot.quantity : lot.quantity.negated(),
//         locationId: entry.locationId,
//         ...details,
//       })),
//     ),
//   );

//   promises.push(
//     tx.insert(schema.inventoryLedger).values({
//       componentId: entry.componentId,
//       batchId: entry.batchId,
//       quantity:
//         direction === "inbound" ? entry.quantity : entry.quantity.negated(),
//       locationId: entry.locationId,
//       ...details,
//     }),
//   );

//   await Promise.all(promises);
// };

// export const updateInventory = async (
//   tx: Transaction,
//   entry: InventoryEntry,
//   type: "inbound" | "outbound" | "allocation" | "deallocation",
// ) => {
//   const promises = [];

//   if (entry.quantity.lt(0)) {
//     throw new Error("Quantity must be greater than 0");
//   }

//   const getTotal = (quantity: Decimal): Decimal => {
//     switch (type) {
//       case "inbound":
//         return quantity;
//       case "outbound":
//         return quantity.negated();
//       case "allocation":
//         return new Decimal(0);
//       case "deallocation":
//         return new Decimal(0);
//     }
//   };

//   const getAllocated = (quantity: Decimal): Decimal => {
//     switch (type) {
//       case "inbound":
//         return new Decimal(0);
//       case "outbound":
//         return new Decimal(0);
//       case "allocation":
//         return quantity;
//       case "deallocation":
//         return quantity.negated();
//     }
//   };

//   const getFree = (quantity: Decimal): Decimal => {
//     switch (type) {
//       case "inbound":
//         return quantity;
//       case "outbound":
//         return quantity.negated();
//       case "allocation":
//         return quantity.negated();
//       case "deallocation":
//         return quantity;
//     }
//   };

//   console.log(entry);
//   console.log(getTotal(entry.quantity));
//   console.log(getAllocated(entry.quantity));
//   console.log(getFree(entry.quantity));

//   promises.push(
//     tx
//       .insert(schema.inventoryLot)
//       .values(
//         entry.lots.map((lot) => ({
//           componentLotId: lot.id,
//           locationId: entry.locationId,
//           totalQuantity: getTotal(lot.quantity),
//           allocatedQuantity: getAllocated(lot.quantity),
//           freeQuantity: getFree(lot.quantity),
//         })),
//       )
//       .onConflictDoUpdate({
//         target: [
//           schema.inventoryLot.componentLotId,
//           schema.inventoryLot.locationId,
//         ],
//         set: {
//           totalQuantity: sql.raw(
//             `"inventory_lot"."${schema.inventoryLot.totalQuantity.name}" + excluded."${schema.inventoryLot.totalQuantity.name}"`,
//           ),
//           allocatedQuantity: sql.raw(
//             `"inventory_lot"."${schema.inventoryLot.allocatedQuantity.name}" + excluded."${schema.inventoryLot.allocatedQuantity.name}"`,
//           ),
//           freeQuantity: sql.raw(
//             `"inventory_lot"."${schema.inventoryLot.freeQuantity.name}" + excluded."${schema.inventoryLot.freeQuantity.name}"`,
//           ),
//         },
//       }),
//   );

//   promises.push(
//     tx
//       .insert(schema.inventory)
//       .values({
//         componentId: entry.componentId,
//         batchId: entry.batchId,
//         locationId: entry.locationId,
//         totalQuantity: getTotal(entry.quantity),
//         allocatedQuantity: getAllocated(entry.quantity),
//         freeQuantity: getFree(entry.quantity),
//         entryDate: new Date(),
//       })
//       .onConflictDoUpdate({
//         target: [
//           schema.inventory.componentId,
//           schema.inventory.batchId,
//           schema.inventory.locationId,
//         ],
//         set: {
//           totalQuantity: sql.raw(
//             `"inventory"."${schema.inventory.totalQuantity.name}" + excluded."${schema.inventory.totalQuantity.name}"`,
//           ),
//           allocatedQuantity: sql.raw(
//             `"inventory"."${schema.inventory.allocatedQuantity.name}" + excluded."${schema.inventory.allocatedQuantity.name}"`,
//           ),
//           freeQuantity: sql.raw(
//             `"inventory"."${schema.inventory.freeQuantity.name}" + excluded."${schema.inventory.freeQuantity.name}"`,
//           ),
//         },
//       }),
//   );

//   await Promise.all(promises);
// };

// export const allocateToTask = async (
//   tx: Transaction,
//   reference: InventoryReference,
//   quantity: Decimal,
//   taskId: number,
//   pickLocationId: number,
//   putLocationId?: number,
// ) => {
//   const entry = await calculateOutboundEntry(
//     tx,
//     reference,
//     pickLocationId,
//     quantity,
//   );

//   const allocations = await tx
//     .insert(schema.taskAllocation)
//     .values({
//       componentId: entry.componentId,
//       batchId: entry.batchId,
//       pickLocationId: pickLocationId,
//       putLocationId: putLocationId,
//       quantity: entry.quantity,
//       taskId: taskId,
//     })
//     .returning();

//   const allocation = allocations[0];

//   if (!allocation) {
//     throw new Error("Failed to create production job allocation");
//   }

//   await tx.insert(schema.taskAllocationLot).values(
//     entry.lots.map((lot) => ({
//       componentLotId: lot.id,
//       taskAllocationId: allocation.id,
//       quantity: lot.quantity,
//     })),
//   );

//   await updateInventory(tx, entry, "allocation");
// };

// export const completeTaskAllocation = async (
//   tx: Transaction,
//   taskAllocationId: number,
//   userId: string,
// ) => {
//   const allocations = await tx
//     .select({
//       componentId: schema.taskAllocation.componentId,
//       batchId: schema.taskAllocation.batchId,
//       pickLocationId: schema.taskAllocation.pickLocationId,
//       putLocationId: schema.taskAllocation.putLocationId,
//       quantity: schema.taskAllocation.quantity,
//       taskId: schema.taskAllocation.taskId,
//       type: schema.task.type,
//       productionJobId: schema.task.productionJobId,
//       salesDespatchId: schema.task.salesDespatchId,
//     })
//     .from(schema.taskAllocation)
//     .where(eq(schema.taskAllocation.id, taskAllocationId))
//     .leftJoin(schema.task, eq(schema.taskAllocation.taskId, schema.task.id))
//     .limit(1);

//   const allocation = allocations[0];

//   if (!allocation?.type) {
//     throw new Error("Task allocation not found");
//   }

//   const allocationLots = await tx
//     .select()
//     .from(schema.taskAllocationLot)
//     .where(eq(schema.taskAllocationLot.taskAllocationId, taskAllocationId));

//   const entry = {
//     componentId: allocation.componentId,
//     batchId: allocation.batchId ?? undefined,
//     quantity: allocation.quantity,
//     lots: allocationLots,
//   };

//   const details: LedgerEntryDetails = {
//     userId,
//     type: allocation.type,
//   };

//   if (allocation.salesDespatchId) {
//     const salesDespatchItem = await tx
//       .insert(schema.salesDespatchItem)
//       .values({
//         despatchId: allocation.salesDespatchId,
//         componentId: entry.componentId,
//         batchId: entry.batchId,
//         quantity: entry.quantity,
//       })
//       .returning({
//         id: schema.salesDespatchItem.id,
//       });

//     details.salesDespatchItemId = salesDespatchItem[0]?.id;
//   }

//   if (allocation.productionJobId && allocation.putLocationId) {
//     const productionAllocations = await tx
//       .insert(schema.productionJobAllocation)
//       .values({
//         componentId: entry.componentId,
//         batchId: entry.batchId,
//         locationId: allocation.putLocationId,
//         totalQuantity: entry.quantity,
//         remainingQuantity: entry.quantity,
//         usedQuantity: new Decimal(0),
//         productionJobId: allocation.productionJobId,
//       })
//       .returning();

//     const productionAllocation = productionAllocations[0];

//     if (!productionAllocation) {
//       throw new Error("Failed to create production job allocation");
//     }

//     await tx.insert(schema.productionJobAllocationLot).values(
//       entry.lots.map((lot) => ({
//         componentLotId: lot.id,
//         productionJobAllocationId: productionAllocation.id,
//         quantity: lot.quantity,
//       })),
//     );

//     await updateInventory(
//       tx,
//       {
//         ...entry,
//         locationId: allocation.putLocationId,
//       },
//       "allocation",
//     );

//     details.productionJobAllocationId = productionAllocation.id;
//   }

//   await tx
//     .update(schema.taskAllocation)
//     .set({
//       isComplete: true,
//     })
//     .where(eq(schema.taskAllocation.id, taskAllocationId));

//   await updateInventory(
//     tx,
//     {
//       ...entry,
//       locationId: allocation.pickLocationId,
//     },
//     "deallocation",
//   );

//   await updateInventory(
//     tx,
//     {
//       ...entry,
//       locationId: allocation.pickLocationId,
//     },
//     "outbound",
//   );
//   await logToLedger(
//     tx,
//     "outbound",
//     {
//       ...entry,
//       locationId: allocation.pickLocationId,
//     },
//     details,
//   );

//   if (allocation.putLocationId) {
//     await updateInventory(
//       tx,
//       {
//         ...entry,
//         locationId: allocation.putLocationId,
//       },
//       "inbound",
//     );

//     await logToLedger(
//       tx,
//       "inbound",
//       {
//         ...entry,
//         locationId: allocation.putLocationId,
//       },
//       details,
//     );
//   }
// };

// export const processProductionOut = async (
//   tx: Transaction,
//   productionJobId: number,
//   quantity: Decimal,
//   userId: string,
// ) => {
//   const jobs = await tx
//     .select()
//     .from(schema.productionJob)
//     .where(eq(schema.productionJob.id, productionJobId))
//     .limit(1);

//   const job = jobs[0];

//   if (!job) {
//     throw new Error("Production job not found");
//   }

//   const wip = await tx.query.component.findFirst({
//     where: eq(schema.component.id, `${job.componentId}WIP`),
//   });

//   const componentId = wip ? wip.id : job.componentId;

//   const subcomponents = await tx
//     .select()
//     .from(schema.subcomponent)
//     .where(eq(schema.subcomponent.componentId, componentId));

//   for (const subcomponent of subcomponents) {
//     const allocations = await tx
//       .select({
//         id: schema.productionJobAllocation.id,
//         componentId: schema.productionJobAllocation.componentId,
//         batchId: schema.productionJobAllocation.batchId,
//         locationId: schema.productionJobAllocation.locationId,
//         remainingQuantity: schema.productionJobAllocation.remainingQuantity,
//         usedQuantity: schema.productionJobAllocation.usedQuantity,
//         totalQuantity: schema.productionJobAllocation.totalQuantity,
//       })
//       .from(schema.productionJobAllocation)
//       .where(
//         and(
//           eq(
//             schema.productionJobAllocation.componentId,
//             subcomponent.subcomponentId,
//           ),
//           eq(schema.productionJobAllocation.productionJobId, productionJobId),
//         ),
//       );

//     let requiredQuantity = quantity.mul(subcomponent.quantity);

//     for (const allocation of allocations) {
//       // Get the lots for this allocation ordered by componentLotId (FIFO)
//       const lots = await tx
//         .select()
//         .from(schema.productionJobAllocationLot)
//         .where(
//           eq(
//             schema.productionJobAllocationLot.productionJobAllocationId,
//             allocation.id,
//           ),
//         )
//         .orderBy(asc(schema.productionJobAllocationLot.componentLotId));

//       let remainingToUse = Decimal.min(
//         allocation.remainingQuantity,
//         requiredQuantity,
//       );
//       const usedLots: { id: number; quantity: Decimal }[] = [];

//       // Use up lots one by one until we have enough quantity
//       for (const lot of lots) {
//         if (remainingToUse.lte(0)) break;

//         const useFromLot = Decimal.min(lot.quantity, remainingToUse);
//         usedLots.push({
//           id: lot.componentLotId,
//           quantity: useFromLot,
//         });
//         remainingToUse = remainingToUse.sub(useFromLot);
//       }

//       const useQuantity = requiredQuantity.sub(remainingToUse);

//       const entry: InventoryEntry = {
//         componentId: allocation.componentId,
//         batchId: allocation.batchId ?? undefined,
//         locationId: allocation.locationId,
//         quantity: useQuantity,
//         lots: usedLots,
//       };

//       // Update the allocation's remaining quantity
//       await tx
//         .update(schema.productionJobAllocation)
//         .set({
//           remainingQuantity: allocation.remainingQuantity.sub(useQuantity),
//           usedQuantity: allocation.usedQuantity.add(useQuantity),
//         })
//         .where(eq(schema.productionJobAllocation.id, allocation.id));

//       // Process the inventory movements
//       await updateInventory(tx, entry, "deallocation");
//       await updateInventory(tx, entry, "outbound");
//       await logToLedger(tx, "outbound", entry, {
//         userId,
//         type: "production",
//         productionJobAllocationId: allocation.id,
//       });

//       requiredQuantity = requiredQuantity.sub(useQuantity);
//       if (requiredQuantity.lte(0)) {
//         break;
//       }
//     }
//   }

//   const entry = await createInboundEntry(
//     tx,
//     {
//       componentId: job.componentId,
//       batchId: job.batchId ?? undefined,
//     },
//     job.outputLocationId,
//     quantity,
//     new Date(),
//     undefined,
//     productionJobId,
//   );

//   await updateInventory(tx, entry, "inbound");
//   await logToLedger(tx, "inbound", entry, {
//     userId,
//     type: "production",
//   });
// };

// export const completeProductionJob = async (
//   tx: Transaction,
//   productionJobId: number,
//   remainingQuantities: {
//     componentId: string;
//     batchId?: number;
//     quantity: Decimal;
//   }[],
//   userId: string,
// ) => {
//   const allocations = await tx
//     .select({
//       componentId: schema.productionJobAllocation.componentId,
//       batchId: schema.productionJobAllocation.batchId,
//       locationId: schema.productionJobAllocation.locationId,
//       remainingQuantity: sum(schema.productionJobAllocation.remainingQuantity)
//         .mapWith(schema.productionJobAllocation.remainingQuantity)
//         .as("remaining_quantity"),
//       usedQuantity: sum(schema.productionJobAllocation.usedQuantity)
//         .mapWith(schema.productionJobAllocation.usedQuantity)
//         .as("used_quantity"),
//       totalQuantity: sum(schema.productionJobAllocation.totalQuantity)
//         .mapWith(schema.productionJobAllocation.totalQuantity)
//         .as("total_quantity"),
//     })
//     .from(schema.productionJobAllocation)
//     .where(eq(schema.productionJobAllocation.productionJobId, productionJobId))
//     .groupBy(
//       schema.productionJobAllocation.componentId,
//       schema.productionJobAllocation.batchId,
//       schema.productionJobAllocation.locationId,
//     );

//   for (const allocation of allocations) {
//     const remainingQuantity =
//       remainingQuantities.find(
//         (r) =>
//           r.componentId === allocation.componentId &&
//           r.batchId === allocation.batchId,
//       )?.quantity ?? new Decimal(0);

//     const difference = remainingQuantity.minus(allocation.remainingQuantity);

//     if (difference.gt(0)) {
//       // Find difference extra
//       // Deallocate actual remaining
//     } else if (difference.eq(0)) {
//       // Deallocate actual remaining
//     } else {
//       // Remove extra difference
//       // Deallocate actual remaining
//     }

//     // const lots = await

//     // await updateInventory(tx, {
//     //   componentId: allocation.componentId,
//     //   batchId: allocation.batchId ?? undefined,
//     //   locationId: allocation.locationId,
//     //   quantity: remainingQuantity,
//     // }, "deallocation");
//   }

//   //     await allocateToTask(tx, {
//   //       componentId: allocation.componentId,
//   //       batchId: allocation.batchId,
//   //     }, remainingQuantity.quantity, allocation.taskId, allocation.locationId, allocation.inputLocationId);

//   // await logToLedger(tx, "outbound", input.remainingQuantities, ctx.user.id);
//   // await completeProductionJob(tx, input.id, ctx.user.id);
// };

// export const adjustInventory = async (
//   tx: Transaction,
//   reference: InventoryReference,
//   locationId: number,
//   quantity: Decimal,
//   type: "correction" | "wastage" | "lost" | "found",
//   userId: string,
// ) => {
//   const currentInventory = await tx
//     .select({
//       freeQuantity: schema.inventory.freeQuantity,
//     })
//     .from(schema.inventory)
//     .where(
//       and(
//         eq(schema.inventory.componentId, reference.componentId),
//         eq(schema.inventory.locationId, locationId),
//         reference.batchId
//           ? eq(schema.inventory.batchId, reference.batchId)
//           : sql`inventory.batch_id IS NULL`,
//       ),
//     )
//     .limit(1);

//   const currentQuantity = currentInventory[0]?.freeQuantity ?? new Decimal(0);
//   const difference = quantity.sub(currentQuantity);

//   if (difference.eq(0)) {
//     return; // No adjustment needed
//   }
//   let entry;

//   if (difference.lt(0)) {
//     entry = await calculateOutboundEntry(
//       tx,
//       reference,
//       locationId,
//       difference.abs(),
//     );
//     await updateInventory(tx, entry, "outbound");
//     await logToLedger(tx, "outbound", entry, {
//       userId,
//       type,
//     });
//   } else {
//     entry = await assignInboundEntry(
//       tx,
//       reference,
//       locationId,
//       difference.abs(),
//     );
//     await updateInventory(tx, entry, "inbound");
//     await logToLedger(tx, "inbound", entry, {
//       userId,
//       type,
//     });
//   }
// };

// export const processReceipt = async (
//   tx: Transaction,
//   reference: InventoryReference,
//   locationId: number,
//   quantity: Decimal,
//   entryDate: Date,
//   purchaseReceiptItemId: number,
//   userId: string,
// ) => {
//   if (quantity.lte(0)) {
//     throw new Error("Receipt quantity must be greater than 0");
//   }

//   const entry = await createInboundEntry(
//     tx,
//     reference,
//     locationId,
//     quantity,
//     entryDate,
//     purchaseReceiptItemId,
//   );

//   await updateInventory(tx, entry, "inbound");
//   await logToLedger(tx, "inbound", entry, {
//     userId,
//     type: "receipt",
//   });
// };

// const overview = db
//   .select({
//     componentId: schema.inventory.componentId,
//     componentDescription: schema.component.description,
//     componentUnit: schema.component.unit,
//     isStockTracked: schema.component.isStockTracked,
//     isBatchTracked: schema.component.isBatchTracked,
//     batchId: schema.inventory.batchId,
//     batchReference: schema.batch.batchReference,
//     entryDate: schema.inventory.entryDate,
//     locationId: schema.inventory.locationId,
//     locationName: schema.location.name,
//     totalQuantity: schema.inventory.totalQuantity,
//     allocatedQuantity: schema.inventory.allocatedQuantity,
//     freeQuantity: schema.inventory.freeQuantity,
//   })
//   .from(schema.inventory)
//   .leftJoin(
//     schema.component,
//     eq(schema.inventory.componentId, schema.component.id),
//   )
//   .leftJoin(
//     schema.location,
//     eq(schema.inventory.locationId, schema.location.id),
//   )
//   .leftJoin(schema.batch, eq(schema.inventory.batchId, schema.batch.id))
//   .as("overview");

// export default datatable(
//   {
//     componentId: "string",
//     componentDescription: "string",
//     componentUnit: "string",
//     isStockTracked: "boolean",
//     isBatchTracked: "boolean",
//     batchId: "number",
//     batchReference: "string",
//     entryDate: "date",
//     locationId: "number",
//     locationName: "string",
//     totalQuantity: "decimal",
//     allocatedQuantity: "decimal",
//     freeQuantity: "decimal",
//   },
//   overview,
// );

// import { Decimal } from "decimal.js";

// import { aliasedTable, eq, schema, sql } from "@repo/db";

// import type { Transaction } from "../../db";
// import type { InventoryEntry, LedgerEntryDetails } from "../inventory/model";
// import { db } from "../../db";
// import { datatable } from "../../lib/datatables";
// import { coalesce } from "../../lib/operators";
// import {
//   calculateOutboundEntry,
//   logToLedger,
//   updateInventory,
// } from "../inventory/model";

// // First create a subquery for task items aggregation

// export const createTask = async (
//   tx: Transaction,
//   details: typeof schema.task.$inferInsert,
//   allocations: (typeof schema.taskAllocation.$inferInsert)[],
// ) => {
//   const tasks = await tx
//     .insert(schema.task)
//     .values({
//       ...details,
//     })
//     .returning({
//       id: schema.task.id,
//     });

//   const task = tasks[0];
//   if (!task) {
//     throw new Error("Failed to create task");
//   }

//   const promises = allocations.map(async (allocation) => {
//     return Promise.all([
//       calculateOutboundEntry(
//         tx,
//         {
//           componentId: allocation.componentId,
//           batchId: allocation.batchId ?? undefined,
//         },
//         allocation.pickLocationId,
//         allocation.quantity,
//       ),
//       tx.insert(schema.taskAllocation).values(allocation).returning({
//         id: schema.taskAllocation.id,
//       }),
//     ]).then(async ([entry, taskAllocations]) => {
//       const taskAllocation = taskAllocations[0];
//       if (!taskAllocation) {
//         throw new Error("Failed to create task allocation");
//       }

//       return Promise.all([
//         updateInventory(tx, entry, "allocation"),
//         tx.insert(schema.taskAllocationLot).values(
//           entry.lots.map((lot) => ({
//             componentLotId: lot.id,
//             taskAllocationId: taskAllocation.id,
//             quantity: lot.quantity,
//           })),
//         ),
//       ]);
//     });
//   });

//   await Promise.all(promises);
// };

// export const cancelTask = async (tx: Transaction, taskId: number) => {
//   const task = await tx.query.task.findFirst({
//     where: eq(schema.task.id, taskId),
//   });

//   if (!task) {
//     throw new Error(`Task ${taskId} not found`);
//   }

//   if (task.isCancelled) {
//     throw new Error(`Task ${taskId} is already cancelled`);
//   }

//   const allocations = await tx.query.taskAllocation.findMany({
//     where: eq(schema.taskAllocation.taskId, taskId),
//   });

//   const promises = allocations.map(async (allocation) => {
//     if (allocation.isComplete) {
//       return;
//     }

//     const allocationLots = await tx
//       .delete(schema.taskAllocationLot)
//       .where(eq(schema.taskAllocationLot.taskAllocationId, allocation.id))
//       .returning({
//         id: schema.taskAllocationLot.id,
//         componentLotId: schema.taskAllocationLot.componentLotId,
//         quantity: schema.taskAllocationLot.quantity,
//       });

//     const entry = {
//       componentId: allocation.componentId,
//       batchId: allocation.batchId ?? undefined,
//       quantity: allocation.quantity,
//       lots: allocationLots.map((lot) => ({
//         id: lot.componentLotId,
//         quantity: lot.quantity,
//       })),
//     };

//     await updateInventory(
//       tx,
//       { locationId: allocation.pickLocationId, ...entry },
//       "deallocation",
//     );
//   });

//   await Promise.all(promises);

//   await tx
//     .update(schema.task)
//     .set({ isCancelled: true })
//     .where(eq(schema.task.id, taskId));
// };

// export const completeTaskAllocation = async (
//   tx: Transaction,
//   taskAllocationId: number,
//   userId: string,
// ) => {
//   const allocation = await tx.query.taskAllocation.findFirst({
//     where: eq(schema.taskAllocation.id, taskAllocationId),
//     with: {
//       task: true,
//     },
//   });

//   if (!allocation) {
//     throw new Error(`Task allocation ${taskAllocationId} not found`);
//   }

//   if (allocation.isComplete) {
//     throw new Error(`Task allocation ${taskAllocationId} is already completed`);
//   }

//   if (allocation.task.isCancelled) {
//     throw new Error(
//       `Cannot complete allocation for cancelled task ${allocation.task.id}`,
//     );
//   }

//   // Update completion status first to prevent race conditions
//   const updated = await tx
//     .update(schema.taskAllocation)
//     .set({ isComplete: true })
//     .where(eq(schema.taskAllocation.id, taskAllocationId))
//     .returning({ id: schema.taskAllocation.id });

//   if (!updated.length) {
//     throw new Error(
//       `Failed to mark task allocation ${taskAllocationId} as complete`,
//     );
//   }

//   const allocationLots = await tx
//     .delete(schema.taskAllocationLot)
//     .where(eq(schema.taskAllocationLot.taskAllocationId, allocation.id))
//     .returning({
//       id: schema.taskAllocationLot.id,
//       componentLotId: schema.taskAllocationLot.componentLotId,
//       quantity: schema.taskAllocationLot.quantity,
//     });

//   const entry = {
//     componentId: allocation.componentId,
//     batchId: allocation.batchId ?? undefined,
//     quantity: allocation.quantity,
//     lots: allocationLots.map((lot) => ({
//       id: lot.componentLotId,
//       quantity: lot.quantity,
//     })),
//   };

//   const details: LedgerEntryDetails = {
//     userId,
//     type: allocation.task.type,
//   };

//   if (allocation.task.type === "despatch") {
//     if (!allocation.task.salesDespatchId) {
//       throw new Error("Despatch task has no sales despatch id");
//     }

//     details.salesDespatchItemId = await createSalesDespatchItem(
//       tx,
//       allocation.task.salesDespatchId,
//       entry.quantity,
//       entry.componentId,
//       entry.batchId,
//     );
//   }

//   if (allocation.task.type === "production") {
//     if (!allocation.task.productionJobId || !allocation.putLocationId) {
//       throw new Error(
//         "Production task has no production job id or put location id",
//       );
//     }

//     details.productionJobAllocationId = await createProductionJobAllocation(
//       tx,
//       allocation.task.productionJobId,
//       {
//         ...entry,
//         locationId: allocation.putLocationId,
//       },
//     );
//   }

//   await updateInventory(
//     tx,
//     { locationId: allocation.pickLocationId, ...entry },
//     "deallocation",
//   );

//   await updateInventory(
//     tx,
//     { locationId: allocation.pickLocationId, ...entry },
//     "outbound",
//   );

//   await logToLedger(
//     tx,
//     "outbound",
//     { locationId: allocation.pickLocationId, ...entry },
//     details,
//   );

//   if (allocation.putLocationId) {
//     await updateInventory(
//       tx,
//       { locationId: allocation.putLocationId, ...entry },
//       "inbound",
//     );
//     await logToLedger(
//       tx,
//       "inbound",
//       { locationId: allocation.putLocationId, ...entry },
//       details,
//     );

//     if (allocation.task.type === "production") {
//       await updateInventory(
//         tx,
//         { locationId: allocation.putLocationId, ...entry },
//         "allocation",
//       );
//     }
//   }

//   return allocationLots;
// };

// const createSalesDespatchItem = async (
//   tx: Transaction,
//   despatchId: number,
//   quantity: Decimal,
//   componentId: string,
//   batchId?: number,
// ) => {
//   const despatchItems = await tx
//     .insert(schema.salesDespatchItem)
//     .values({
//       despatchId: despatchId,
//       componentId: componentId,
//       batchId: batchId ?? undefined,
//       quantity: quantity,
//     })
//     .returning({
//       id: schema.salesDespatchItem.id,
//     });

//   const despatchItem = despatchItems[0];
//   if (!despatchItem) {
//     throw new Error("Failed to create despatch item");
//   }

//   return despatchItem.id;
// };

// const createProductionJobAllocation = async (
//   tx: Transaction,
//   productionJobId: number,
//   entry: InventoryEntry,
// ) => {
//   const productionJobAllocations = await tx
//     .insert(schema.productionJobAllocation)
//     .values({
//       productionJobId: productionJobId,
//       componentId: entry.componentId,
//       batchId: entry.batchId,
//       locationId: entry.locationId,
//       totalQuantity: entry.quantity,
//       remainingQuantity: entry.quantity,
//       usedQuantity: new Decimal(0),
//     })
//     .returning({
//       id: schema.productionJobAllocation.id,
//     });

//   const productionJobAllocation = productionJobAllocations[0];
//   if (!productionJobAllocation) {
//     throw new Error("Failed to create production job allocation");
//   }

//   await tx.insert(schema.productionJobAllocationLot).values(
//     entry.lots.map((lot) => ({
//       productionJobAllocationId: productionJobAllocation.id,
//       componentLotId: lot.id,
//       quantity: lot.quantity,
//     })),
//   );

//   return productionJobAllocation.id;
// };
