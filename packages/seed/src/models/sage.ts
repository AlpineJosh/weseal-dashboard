import { faker } from "@faker-js/faker";
import Decimal from "decimal.js";

import { sageSchema } from "@repo/db";

import { db } from "../../db";

// Stock categories
const STOCK_CATEGORIES = [
  { number: 1, name: "Raw Materials" },
  { number: 2, name: "Work in Progress" },
  { number: 3, name: "Finished Goods" },
  { number: 4, name: "Packaging" },
  { number: 5, name: "Consumables" },
] as const;

// Stock transaction types
const STOCK_TRAN_TYPES = [
  "RECEIPT",
  "DESPATCH",
  "TRANSFER",
  "PRODUCTION",
  "ADJUSTMENT",
] as const;

// Generate a random stock item
export const generateStockItem = () => {
  const category = faker.helpers.arrayElement(STOCK_CATEGORIES);
  const stockCode = faker.string.alphanumeric({ length: 8, casing: "upper" });

  return {
    STOCK_CODE: stockCode,
    DESCRIPTION: faker.commerce.productName(),
    UNIT_OF_SALE: faker.helpers.arrayElement(["EA", "KG", "M", "L"]),
    NOMINAL_CODE: faker.string.alphanumeric({ length: 4 }),
    LOCATION: faker.helpers.arrayElement([
      "WAREHOUSE",
      "PRODUCTION",
      "QUALITY",
    ]),
    STOCK_CAT: category.number,
    STOCK_CAT_NAME: category.name,
    QTY_IN_STOCK: faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }),
    QTY_ALLOCATED: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
    AVERAGE_COST_PRICE: faker.number.float({
      min: 1,
      max: 1000,
      fractionDigits: 2,
    }),
    SALES_PRICE: faker.number.float({ min: 1, max: 2000, fractionDigits: 2 }),
    UNIT_WEIGHT: faker.number.float({ min: 0.1, max: 100, fractionDigits: 2 }),
    BARCODE: faker.string.alphanumeric({ length: 13 }),
    RECORD_CREATE_DATE: new Date(),
    RECORD_MODIFY_DATE: new Date(),
    RECORD_DELETED: 0,
  };
};

// Generate a stock transaction
export const generateStockTransaction = (
  stockCode: string,
  type: (typeof STOCK_TRAN_TYPES)[number],
) => {
  const quantity = faker.number.float({ min: 1, max: 100, fractionDigits: 2 });
  const costPrice = faker.number.float({
    min: 1,
    max: 1000,
    fractionDigits: 2,
  });

  return {
    STOCK_CODE: stockCode,
    TYPE: type,
    DATE: new Date(),
    REFERENCE: faker.string.alphanumeric({ length: 8 }),
    REFERENCE_NUMERIC: faker.number.int({ min: 1000, max: 9999 }),
    DETAILS: faker.lorem.sentence(),
    QUANTITY:
      type === "DESPATCH" || type === "ADJUSTMENT" ? -quantity : quantity,
    COST_PRICE: costPrice,
    SALES_PRICE: costPrice * 1.5,
    RECORD_CREATE_DATE: new Date(),
    RECORD_MODIFY_DATE: new Date(),
    RECORD_DELETED: 0,
  };
};

// Seed stock categories
export const seedStockCategories = async () => {
  await db.insert(sageSchema.STOCK_CAT).values(STOCK_CATEGORIES);
};

// Seed stock items
export const seedStockItems = async (count: number = 50) => {
  const stockItems = Array.from({ length: count }, generateStockItem);
  await db.insert(sageSchema.STOCK).values(stockItems);
  return stockItems;
};

// Seed stock transactions
export const seedStockTransactions = async (
  stockItems: (typeof sageSchema.STOCK.$inferSelect)[],
  transactionsPerItem: number = 5,
) => {
  const transactions = stockItems.flatMap((item) =>
    Array.from({ length: transactionsPerItem }, () =>
      generateStockTransaction(
        item.STOCK_CODE,
        faker.helpers.arrayElement(STOCK_TRAN_TYPES),
      ),
    ),
  );

  await db.insert(sageSchema.STOCK_TRAN).values(transactions);
  return transactions;
};

// Main seeding function
export const seedSageData = async () => {
  await seedStockCategories();
  const stockItems = await seedStockItems();
  const transactions = await seedStockTransactions(stockItems);

  return {
    stockItems,
    transactions,
  };
};
