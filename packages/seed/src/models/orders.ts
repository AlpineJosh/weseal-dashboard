import type { NeonQueryResultHKT } from "drizzle-orm/neon-serverless";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { faker } from "@faker-js/faker";
import { db } from "#db";
import Decimal from "decimal.js";
import { eq } from "drizzle-orm";

import type { ExtractTablesWithRelations, Schema } from "@repo/db";
import { schema } from "@repo/db";

import { createDespatch, createReceipt } from "./inventory";

type Transaction = PgTransaction<
  NeonQueryResultHKT,
  Schema,
  ExtractTablesWithRelations<Schema>
>;

// Generate a random purchase order
export const generatePurchaseOrder = (supplierId: string) => {
  const orderDate = faker.date.past();
  const deliveryDate = faker.date.future({ years: 1, refDate: orderDate });

  return {
    supplierId,
    isQuote: faker.datatype.boolean(),
    isComplete: faker.datatype.boolean(),
    isCancelled: faker.datatype.boolean(),
    orderDate,
    createdAt: new Date(),
    lastModified: new Date(),
    isDeleted: false,
  };
};

// Generate a random purchase order item
export const generatePurchaseOrderItem = (
  orderId: number,
  componentId: string,
) => {
  const quantityOrdered = new Decimal(
    faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
  );

  return {
    orderId,
    componentId,
    quantityOrdered,
    sageQuantityReceived: new Decimal(0),
    createdAt: new Date(),
    lastModified: new Date(),
    isDeleted: false,
  };
};

// Generate a random sales order
export const generateSalesOrder = (customerId: string) => {
  const orderDate = faker.date.past();
  const despatchDate = faker.date.future({ years: 1, refDate: orderDate });

  return {
    customerId,
    orderDate,
    isQuote: faker.datatype.boolean(),
    isCancelled: faker.datatype.boolean(),
    isComplete: faker.datatype.boolean(),
    createdAt: new Date(),
    lastModified: new Date(),
    isDeleted: false,
  };
};

// Generate a random sales order item
export const generateSalesOrderItem = (
  orderId: number,
  componentId: string,
) => {
  const quantityOrdered = new Decimal(
    faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
  );

  return {
    orderId,
    componentId,
    quantityOrdered,
    sageQuantityDespatched: new Decimal(0),
    createdAt: new Date(),
    lastModified: new Date(),
    isDeleted: false,
  };
};

// Seed purchase orders
export const seedPurchaseOrders = async (
  supplierId: string,
  count: number = 5,
  userId: string,
) => {
  return await db.transaction(async (tx: Transaction) => {
    // Create purchase orders
    const orders = await Promise.all(
      Array.from({ length: count }, async () => {
        const order = generatePurchaseOrder(supplierId);
        const result = await tx
          .insert(schema.purchaseOrder)
          .values(order)
          .returning();
        return result[0];
      }),
    );

    // Get all components
    const components = await tx.query.component.findMany();

    // Create order items and receipts for each order
    const orderItems = await Promise.all(
      orders.flatMap((order: (typeof orders)[number]) =>
        Array.from(
          { length: faker.number.int({ min: 1, max: 5 }) },
          async () => {
            const component = faker.helpers.arrayElement(
              components,
            ) as (typeof components)[number];
            const item = generatePurchaseOrderItem(order.id, component.id);
            const result = await tx
              .insert(schema.purchaseOrderItem)
              .values(item)
              .returning();

            // Create a receipt for the order item
            await createReceipt(
              tx,
              component.id,
              1, // Default to warehouse location
              item.quantityOrdered,
              userId,
            );

            return result[0];
          },
        ),
      ),
    );

    return { orders, orderItems };
  });
};

// Seed sales orders
export const seedSalesOrders = async (
  customerId: string,
  count: number = 5,
  userId: string,
) => {
  return await db.transaction(async (tx: Transaction) => {
    // Create sales orders
    const orders = await Promise.all(
      Array.from({ length: count }, async () => {
        const order = generateSalesOrder(customerId);
        const result = await tx
          .insert(schema.salesOrder)
          .values(order)
          .returning();
        return result[0];
      }),
    );

    // Get all components
    const components = await tx.query.component.findMany();

    // Create order items and despatches for each order
    const orderItems = await Promise.all(
      orders.flatMap((order: (typeof orders)[number]) =>
        Array.from(
          { length: faker.number.int({ min: 1, max: 5 }) },
          async () => {
            const component = faker.helpers.arrayElement(
              components,
            ) as (typeof components)[number];
            const item = generateSalesOrderItem(order.id, component.id);
            const result = await tx
              .insert(schema.salesOrderItem)
              .values(item)
              .returning();

            // Create a despatch for the order item
            await createDespatch(
              tx,
              component.id,
              1, // Default to warehouse location
              item.quantityOrdered,
              userId,
              userId,
            );

            return result[0];
          },
        ),
      ),
    );

    return { orders, orderItems };
  });
};

// Main seeding function
export const seedOrders = async () => {
  // Create a supplier and customer for orders
  const supplier = await db
    .insert(schema.supplier)
    .values({
      id: faker.string.uuid(),
      name: faker.company.name(),
      createdAt: new Date(),
      lastModified: new Date(),
      isDeleted: false,
    })
    .returning();

  const customer = await db
    .insert(schema.customer)
    .values({
      id: faker.string.uuid(),
      name: faker.company.name(),
      createdAt: new Date(),
      lastModified: new Date(),
      isDeleted: false,
    })
    .returning();

  if (!supplier[0] || !customer[0]) {
    throw new Error("Failed to create supplier or customer");
  }

  // Get the admin user for operations
  const adminUser = await db.query.profile.findFirst({
    where: eq(schema.profile.email, "admin@weseal.com"),
  });

  if (!adminUser) {
    throw new Error("Admin user not found");
  }

  // Seed purchase orders
  const purchaseOrders = await seedPurchaseOrders(
    supplier[0].id,
    5,
    adminUser.id,
  );

  // Seed sales orders
  const salesOrders = await seedSalesOrders(customer[0].id, 5, adminUser.id);

  return {
    supplier: supplier[0],
    customer: customer[0],
    purchaseOrders,
    salesOrders,
  };
};
