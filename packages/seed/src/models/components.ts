import { faker } from "@faker-js/faker";
import { db } from "#db.js";
import Decimal from "decimal.js";

import { eq, schema } from "@repo/db";

const COMPONENTS = {
  // Raw Materials
  RAW_MATERIAL_A: "RAW_MATERIAL_A",
  RAW_MATERIAL_B: "RAW_MATERIAL_B",
  RAW_MATERIAL_C: "RAW_MATERIAL_C",

  // Work in Progress (WIP)
  WIP_ASSEMBLY_A: "WIP_ASSEMBLY_A",
  WIP_ASSEMBLY_B: "WIP_ASSEMBLY_B",
  WIP_PACKAGING: "WIP_PACKAGING",

  // Finished Goods
  FINISHED_PRODUCT_A: "FINISHED_PRODUCT_A",
  FINISHED_PRODUCT_B: "FINISHED_PRODUCT_B",
  FINISHED_PRODUCT_C: "FINISHED_PRODUCT_C",

  // Non-Tracked
  NON_TRACKED: "NON_TRACKED",
} as const;

export type ComponentType = keyof typeof COMPONENTS;

export const seedComponents = async () => {
  await seedComponent({
    id: COMPONENTS.RAW_MATERIAL_A,
    isBatchTracked: false,
  });

  await seedComponent({
    id: COMPONENTS.RAW_MATERIAL_B,
    isBatchTracked: false,
  });

  await seedComponent({
    id: COMPONENTS.RAW_MATERIAL_C,
    isBatchTracked: false,
  });

  await seedComponent({
    id: COMPONENTS.WIP_PACKAGING,
    isBatchTracked: false,
  });

  await seedComponent({
    id: COMPONENTS.WIP_ASSEMBLY_A,
    subcomponents: [
      {
        id: COMPONENTS.RAW_MATERIAL_A,
        quantity: new Decimal(10.123),
      },
    ],
  });

  await seedComponent({
    id: COMPONENTS.WIP_ASSEMBLY_B,
    subcomponents: [
      {
        id: COMPONENTS.RAW_MATERIAL_B,
        quantity: new Decimal(10.123),
      },
    ],
  });

  await seedComponent({
    id: COMPONENTS.FINISHED_PRODUCT_A,
    subcomponents: [
      {
        id: COMPONENTS.WIP_ASSEMBLY_A,
        quantity: new Decimal(72.123),
      },
      {
        id: COMPONENTS.WIP_PACKAGING,
        quantity: new Decimal(1),
      },
    ],
  });

  await seedComponent({
    id: COMPONENTS.FINISHED_PRODUCT_B,
    isBatchTracked: false,
    subcomponents: [
      {
        id: COMPONENTS.WIP_ASSEMBLY_B,
        quantity: new Decimal(2),
      },
      {
        id: COMPONENTS.WIP_PACKAGING,
        quantity: new Decimal(1),
      },
    ],
  });

  await seedComponent({
    id: COMPONENTS.FINISHED_PRODUCT_C,
    subcomponents: [
      {
        id: COMPONENTS.RAW_MATERIAL_C,
        quantity: new Decimal(0.03),
      },
      {
        id: COMPONENTS.WIP_PACKAGING,
        quantity: new Decimal(0.01),
      },
    ],
  });

  await seedComponent({
    id: COMPONENTS.NON_TRACKED,
    isBatchTracked: false,
    isStockTracked: false,
  });

  // Generate 20 random components
  await seedRandomComponents(200);
};

export type SeedComponentParams = {
  id?: string;
  unit?: string;
  categoryId?: number;
  departmentId?: number;
  quantity?: number;
  isStockTracked?: boolean;
  isBatchTracked?: boolean;
  subcomponents?: { id: string; quantity: Decimal }[];
};

export const seedComponent = async ({
  id = faker.commerce.isbn(),
  unit = faker.helpers.arrayElement(["kg", "EACH", "Spool", "SQM"]),
  categoryId = faker.number.int({ min: 1, max: 3 }),
  departmentId = faker.number.int({ min: 1, max: 3 }),
  quantity = faker.number.float({ min: 0, max: 1000, fractionDigits: 6 }),
  isStockTracked = true,
  isBatchTracked = true,
  subcomponents = [],
}: SeedComponentParams) => {
  await db.insert(schema.STOCK).values({
    STOCK_CODE: id,
    UNIT_OF_SALE: unit,
    STOCK_CAT: categoryId,
    DEPT_NUMBER: departmentId,
    QTY_IN_STOCK: quantity,
    ...subcomponents.map(({ id, quantity }, index) => ({
      [`COMPONENT_QTY_${index + 1}`]: quantity,
      [`COMPONENT_CODE_${index + 1}`]: id,
    })),
  });

  await db
    .update(schema.component)
    .set({
      isBatchTracked,
      isStockTracked,
      hasSubcomponents: subcomponents.length > 0,
    })
    .where(eq(schema.component.id, id));
};

export const seedRandomComponents = async (count: number = 10) => {
  const units = [
    "kg",
    "EACH",
    "Spool",
    "SQM",
    "L",
    "M",
    "PCS",
    "BOX",
    "ROLL",
    "SET",
  ];

  for (let i = 0; i < count; i++) {
    const unit = faker.helpers.arrayElement(units);
    const isBatchTracked = faker.datatype.boolean();
    const isStockTracked = faker.datatype.boolean();

    // Generate a realistic component ID based on category
    const id = faker.commerce.isbn();

    // Randomly decide if this component should have subcomponents
    const hasSubcomponents = faker.datatype.boolean();
    const subcomponents = hasSubcomponents
      ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
          id: faker.helpers.arrayElement(
            Object.values([
              COMPONENTS.RAW_MATERIAL_A,
              COMPONENTS.RAW_MATERIAL_B,
              COMPONENTS.RAW_MATERIAL_C,
              COMPONENTS.NON_TRACKED,
              COMPONENTS.WIP_ASSEMBLY_A,
              COMPONENTS.WIP_ASSEMBLY_B,
            ]),
          ),
          quantity: new Decimal(
            faker.number.float({ min: 0.1, max: 100, fractionDigits: 3 }),
          ),
        }))
      : [];

    await seedComponent({
      id,
      unit,
      categoryId: faker.number.int({ min: 1, max: 3 }),
      departmentId: faker.number.int({ min: 1, max: 3 }),
      isBatchTracked,
      isStockTracked,
      subcomponents,
    });
  }
};
