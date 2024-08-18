import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  pgSchema,
  pgTable,
  serial,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const department = pgTable("department", {
  id: integer("id").primaryKey(),
  name: varchar("name").notNull(),
  lastModified: timestamp("last_modified").notNull(),
});

export const departmentRelations = relations(department, ({ many }) => ({
  components: many(stockComponent),
}));

export const stockCategory = pgTable("stock_category", {
  id: integer("id").primaryKey(),
  name: varchar("name").notNull(),
});

export const stockCategoryRelations = relations(stockCategory, ({ many }) => ({
  components: many(stockComponent),
}));

export const stockComponent = pgTable("stock_component", {
  id: varchar("id").primaryKey(),
  stockCategoryId: smallint("stock_category_id").references(
    () => stockCategory.id,
  ),
  description: varchar("description"),
  hasSubcomponents: boolean("has_subcomponents").notNull().default(false),
  sageQuantity: decimal("sage_quantity").notNull(),
  unitOfSale: varchar("unit_of_sale"),
  departmentId: integer("department_id").references(() => department.id),
  lastModified: timestamp("last_modified").notNull(),
  isTraceable: boolean("traceable").default(false),
  // defaultLocationId: integer("default_location_id").references(
  //   () => location.id,
  // ),
  requiresQualityCheck: boolean("requires_quality_check").default(false),
  qualityCheckDetails: varchar("quality_check_details"),
});

export const stockComponentRelations = relations(
  stockComponent,
  ({ one, many }) => ({
    subcomponents: many(stockSubcomponent),
    department: one(department, {
      fields: [stockComponent.departmentId],
      references: [department.id],
    }),
    stockCategory: one(stockCategory, {
      fields: [stockComponent.stockCategoryId],
      references: [stockCategory.id],
    }),
    salesOrderItems: many(salesOrderItem),
    purchaseOrderItems: many(purchaseOrderItem),
  }),
);

export const stockSubcomponent = pgTable("stock_subcomponent", {
  id: serial("id").primaryKey(),
  componentId: varchar("component_id")
    .notNull()
    .references(() => stockComponent.id),
  subcomponentId: varchar("subcomponent_id")
    .notNull()
    .references(() => stockComponent.id),
  level: smallint("level"),
  quantity: decimal("quantity").notNull(),
  lastModified: timestamp("last_modified").notNull(),
});

export const stockSubcomponentRelations = relations(
  stockSubcomponent,
  ({ one, many }) => ({
    component: one(stockComponent, {
      fields: [stockSubcomponent.componentId],
      references: [stockComponent.id],
    }),
    subcomponent: one(stockComponent, {
      fields: [stockSubcomponent.subcomponentId],
      references: [stockComponent.id],
    }),
    transactions: many(stockTransaction),
  }),
);

export const stockTransaction = pgTable("stock_transaction", {
  id: integer("id").primaryKey(),
  componentId: varchar("component_id")
    .notNull()
    .references(() => stockComponent.id),
  transactionType: varchar("transaction_type").notNull(),
  quantity: decimal("quantity").notNull(),
  date: timestamp("date").notNull(),
  lastModified: timestamp("last_modified").notNull(),
});

export const stockTransactionRelations = relations(
  stockTransaction,
  ({ one }) => ({
    stock: one(stockComponent, {
      fields: [stockTransaction.componentId],
      references: [stockComponent.id],
    }),
  }),
);

export const customer = pgTable("customer", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  lastModified: timestamp("last_modified").notNull(),
});

export const customerRelations = relations(customer, ({ many }) => ({
  orders: many(salesOrder),
}));

export const salesOrder = pgTable("sales_order", {
  id: integer("id").primaryKey(),
  customerId: varchar("customer_id")
    .notNull()
    .references(() => customer.id),
  orderDate: timestamp("order_date"),
  orderStatus: varchar("order_status"),
  lastModified: timestamp("last_modified").notNull(),
});

export const salesOrderRelations = relations(salesOrder, ({ one, many }) => ({
  customer: one(customer, {
    fields: [salesOrder.customerId],
    references: [customer.id],
  }),
  items: many(salesOrderItem),
}));

export const salesOrderItem = pgTable("sales_order_item", {
  id: integer("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => salesOrder.id),
  componentId: varchar("component_id")
    .notNull()
    .references(() => stockComponent.id),
  deliveryDate: timestamp("delivery_date"),
  quantity: decimal("quantity").notNull(),
  lastModified: timestamp("last_modified").notNull(),
});

export const salesOrderItemRelations = relations(salesOrderItem, ({ one }) => ({
  order: one(salesOrder, {
    fields: [salesOrderItem.orderId],
    references: [salesOrder.id],
  }),
  component: one(stockComponent, {
    fields: [salesOrderItem.componentId],
    references: [stockComponent.id],
  }),
}));

export const salesDespatch = pgTable("sales_despatch", {
  id: integer("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => salesOrder.id),
  dueDate: timestamp("due_date"),
  despatchDate: timestamp("despatch_date"),
  despatchStatus: varchar("despatch_status"),
  lastModified: timestamp("last_modified").notNull(),
});

export const salesDespatchRelations = relations(salesDespatch, ({ one }) => ({
  order: one(salesOrder, {
    fields: [salesDespatch.orderId],
    references: [salesOrder.id],
  }),
}));

export const salesDespatchItem = pgTable("sales_despatch_item", {
  id: integer("id").primaryKey(),
  despatchId: integer("despatch_id")
    .notNull()
    .references(() => salesDespatch.id),
  // batchId: varchar("batch_id")
  //   .notNull()
  //   .references(() => stockBatch.id),
  quantity: decimal("quantity").notNull(),
  lastModified: timestamp("last_modified").notNull(),
});

export const supplier = pgTable("supplier", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  lastModified: timestamp("last_modified").notNull(),
});

export const supplierRelations = relations(supplier, ({ many }) => ({
  orders: many(purchaseOrder),
}));

export const purchaseOrder = pgTable("purchase_order", {
  id: integer("id").primaryKey(),
  supplierId: varchar("supplier_id")
    .notNull()
    .references(() => supplier.id),
  orderOrQuote: varchar("order_or_quote"),
  orderDate: timestamp("order_date"),
  deliveryDate: timestamp("delivery_date"),
  orderStatusCode: smallint("order_status_code"),
  orderStatus: varchar("order_status"),
  deliveryStatusCode: smallint("delivery_status_code"),
  deliveryStatus: varchar("delivery_status"),
  lastModified: timestamp("last_modified").notNull(),
});

export const purchaseOrderRelations = relations(
  purchaseOrder,
  ({ one, many }) => ({
    supplier: one(supplier, {
      fields: [purchaseOrder.supplierId],
      references: [supplier.id],
    }),
    items: many(purchaseOrderItem),
  }),
);

export const purchaseOrderItem = pgTable("purchase_order_item", {
  id: integer("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => purchaseOrder.id),
  componentId: varchar("component_id")
    .notNull()
    .references(() => stockComponent.id),
  deliveryDate: timestamp("delivery_date"),
  description: varchar("description"),
  dueDate: timestamp("due_date"),
  quantityAllocated: decimal("quantity_allocated"),
  quantityDelivered: decimal("quantity_delivered"),
  quantityDespatch: decimal("quantity_despatch"),
  quantityOrder: decimal("quantity_order"),
  modifyDate: timestamp("modify_date").notNull(),
});

export const purchaseOrderItemRelations = relations(
  purchaseOrderItem,
  ({ one }) => ({
    order: one(purchaseOrder, {
      fields: [purchaseOrderItem.orderId],
      references: [purchaseOrder.id],
    }),
    component: one(stockComponent, {
      fields: [purchaseOrderItem.componentId],
      references: [stockComponent.id],
    }),
  }),
);
