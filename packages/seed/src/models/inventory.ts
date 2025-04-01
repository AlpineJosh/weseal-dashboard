import { faker } from "@faker-js/faker";
import { updateInventory } from "#models/inventory/inventory";
import { logToLedger } from "#models/inventory/ledger";
import { createInboundEntry } from "#models/inventory/lots";
import { createTask } from "#models/task/task";
import Decimal from "decimal.js";

import { schema } from "@repo/db";

import { db } from "../../db";

// Location types
const LOCATION_TYPES = [
  { id: 1, name: "Warehouse" },
  { id: 2, name: "Production" },
  { id: 3, name: "Quality Control" },
  { id: 4, name: "Shipping" },
] as const;

// Location groups
const LOCATION_GROUPS = [
  { id: 1, name: "Main Warehouse" },
  { id: 2, name: "Production Area" },
  { id: 3, name: "Quality Area" },
  { id: 4, name: "Shipping Area" },
] as const;

// Generate a random location
export const generateLocation = () => {
  const type = faker.helpers.arrayElement(LOCATION_TYPES);
  const group = faker.helpers.arrayElement(LOCATION_GROUPS);

  return {
    name: faker.location.buildingNumber(),
    description: faker.location.streetAddress(),
    typeId: type.id,
    groupId: group.id,
    isActive: true,
    createdAt: new Date(),
    lastModified: new Date(),
  };
};

// Generate a random inventory entry
export const generateInventoryEntry = (
  componentId: string,
  locationId: number,
) => {
  const quantity = new Decimal(
    faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
  );

  return {
    componentId,
    locationId,
    totalQuantity: quantity,
    allocatedQuantity: new Decimal(0),
    freeQuantity: quantity,
    entryDate: new Date(),
    createdAt: new Date(),
    lastModified: new Date(),
  };
};

// Create a receipt
export const createReceipt = async (
  tx: typeof db,
  componentId: string,
  locationId: number,
  quantity: Decimal,
  userId: string,
) => {
  const entry = await createInboundEntry(tx, {
    reference: { componentId },
    locationId,
    quantity,
  });

  await updateInventory(tx, {
    entry,
    type: "inbound",
  });

  await logToLedger(tx, {
    direction: "inbound",
    entry,
    details: {
      userId,
      type: "receipt",
    },
  });

  return entry;
};

// Create a production job
export const createProductionJob = async (
  tx: typeof db,
  componentId: string,
  outputLocationId: number,
  targetQuantity: Decimal,
  assignedToId: string,
  createdById: string,
) => {
  const job = await tx
    .insert(schema.productionJob)
    .values({
      componentId,
      batchReference: faker.string.alphanumeric({ length: 8 }),
      outputLocationId,
      targetQuantity,
      status: "pending",
      createdAt: new Date(),
      lastModified: new Date(),
    })
    .returning();

  const task = await createTask(tx, {
    type: "production",
    assignedToId,
    createdById,
    productionJobId: job[0].id,
    allocations: [],
  });

  return { job: job[0], task };
};

// Create a transfer task
export const createTransfer = async (
  tx: typeof db,
  componentId: string,
  fromLocationId: number,
  toLocationId: number,
  quantity: Decimal,
  assignedToId: string,
  createdById: string,
) => {
  const task = await createTask(tx, {
    type: "transfer",
    assignedToId,
    createdById,
    allocations: [
      {
        reference: { componentId },
        quantity,
        pickLocationId: fromLocationId,
        putLocationId: toLocationId,
      },
    ],
  });

  return task;
};

// Create an adjustment
export const createAdjustment = async (
  tx: typeof db,
  componentId: string,
  locationId: number,
  quantity: Decimal,
  type: "correction" | "wastage" | "lost" | "found",
  userId: string,
) => {
  const entry = await createInboundEntry(tx, {
    reference: { componentId },
    locationId,
    quantity,
  });

  await updateInventory(tx, {
    entry,
    type: "inbound",
  });

  await logToLedger(tx, {
    direction: "inbound",
    entry,
    details: {
      userId,
      type,
    },
  });

  return entry;
};

// Create a despatch
export const createDespatch = async (
  tx: typeof db,
  componentId: string,
  locationId: number,
  quantity: Decimal,
  assignedToId: string,
  createdById: string,
) => {
  const despatch = await tx
    .insert(schema.salesDespatch)
    .values({
      status: "pending",
      createdAt: new Date(),
      lastModified: new Date(),
    })
    .returning();

  const task = await createTask(tx, {
    type: "despatch",
    assignedToId,
    createdById,
    salesDespatchId: despatch[0].id,
    allocations: [
      {
        reference: { componentId },
        quantity,
        pickLocationId: locationId,
        putLocationId: null,
      },
    ],
  });

  return { despatch: despatch[0], task };
};

// Main seeding function
export const seedInventoryData = async () => {
  return await db.transaction(async (tx) => {
    // Create locations
    const locations = await Promise.all(
      Array.from({ length: 10 }, async () => {
        const location = generateLocation();
        const result = await tx
          .insert(schema.location)
          .values(location)
          .returning();
        return result[0];
      }),
    );

    // Create inventory entries for each component
    const components = await tx.query.component.findMany();
    const inventoryEntries = await Promise.all(
      components.map(async (component) => {
        const location = faker.helpers.arrayElement(locations);
        const entry = generateInventoryEntry(component.id, location.id);
        const result = await tx
          .insert(schema.inventory)
          .values(entry)
          .returning();
        return result[0];
      }),
    );

    // Create some sample operations
    const userId = faker.string.uuid();
    const assignedToId = faker.string.uuid();
    const createdById = faker.string.uuid();

    // Create a receipt
    const receipt = await createReceipt(
      tx,
      components[0].id,
      locations[0].id,
      new Decimal(100),
      userId,
    );

    // Create a production job
    const productionJob = await createProductionJob(
      tx,
      components[1].id,
      locations[1].id,
      new Decimal(50),
      assignedToId,
      createdById,
    );

    // Create a transfer
    const transfer = await createTransfer(
      tx,
      components[2].id,
      locations[2].id,
      locations[3].id,
      new Decimal(25),
      assignedToId,
      createdById,
    );

    // Create an adjustment
    const adjustment = await createAdjustment(
      tx,
      components[3].id,
      locations[4].id,
      new Decimal(10),
      "correction",
      userId,
    );

    // Create a despatch
    const despatch = await createDespatch(
      tx,
      components[4].id,
      locations[5].id,
      new Decimal(75),
      assignedToId,
      createdById,
    );

    return {
      locations,
      inventoryEntries,
      operations: {
        receipt,
        productionJob,
        transfer,
        adjustment,
        despatch,
      },
    };
  });
};
