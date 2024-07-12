import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  pgSchema,
  serial,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const sageSchema = pgSchema("sage");

export const jobStatusEnum = sageSchema.enum("job_status", [
  "active",
  "completed",
  "failed",
]);

export const syncJob = sageSchema.table("sync_job", {
  id: serial("id").primaryKey(),
  tableName: varchar("table_name").notNull(),
  jobStart: timestamp("job_start").notNull(),
  jobEnd: timestamp("job_end"),
  status: jobStatusEnum("status").notNull().default("active"),
  intervalStart: timestamp("interval_start"),
  intervalEnd: timestamp("interval_end"),
});

export const department = sageSchema.table("department", {
  id: integer("id").primaryKey(),
  name: varchar("name").notNull(),
  modifyDate: timestamp("modify_date"),
});

export const departmentRelations = relations(department, ({ many }) => ({
  stockComponents: many(stockComponent),
}));

export const stockCategory = sageSchema.table("stock_category", {
  id: integer("id").primaryKey(),
  name: varchar("name").notNull(),
});

export const stockCategoryRelations = relations(stockCategory, ({ many }) => ({
  stockComponents: many(stockComponent),
}));

export const stockComponent = sageSchema.table("stock_component", {
  id: varchar("id").primaryKey(),
  stockCategoryId: smallint("stock_category_id").references(
    () => stockCategory.id,
  ),
  description: varchar("description"),
  hasSubcomponents: boolean("has_subcomponents").notNull().default(false),
  quantityAllocated: decimal("quantity_allocated").notNull(),
  quantityInStock: decimal("quantity_in_stock").notNull(),
  quantityOnOrder: decimal("quantity_on_order").notNull(),
  unitOfSale: varchar("unit_of_sale"),
  departmentId: integer("department_id").references(() => department.id),
  modifyDate: timestamp("modify_date").notNull(),
});

export const stockComponentRelations = relations(
  stockComponent,
  ({ one, many }) => ({
    subcomponents: many(stockComponent),
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

export const stockSubcomponent = sageSchema.table("stock_subcomponent", {
  id: serial("id").primaryKey(),
  componentId: varchar("component_id")
    .notNull()
    .references(() => stockComponent.id),
  subcomponentId: varchar("subcomponent_id")
    .notNull()
    .references(() => stockComponent.id),
  level: smallint("level"),
  quantity: decimal("quantity").notNull(),
  modifyDate: timestamp("modify_date").notNull(),
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

export const stockTransaction = sageSchema.table("stock_transaction", {
  id: integer("id").primaryKey(),
  stockId: varchar("stock_id")
    .notNull()
    .references(() => stockComponent.id),
  transactionType: varchar("transaction_type").notNull(),
  quantity: decimal("quantity").notNull(),
  date: timestamp("date").notNull(),
  modifyDate: timestamp("modify_date").notNull(),
});

export const stockTransactionRelations = relations(
  stockTransaction,
  ({ one }) => ({
    stock: one(stockComponent, {
      fields: [stockTransaction.stockId],
      references: [stockComponent.id],
    }),
  }),
);

export const salesAccount = sageSchema.table("sales_account", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  modifyDate: timestamp("modify_date").notNull(),
});

export const salesAccountRelations = relations(salesAccount, ({ many }) => ({
  orders: many(salesOrder),
}));

export const salesOrder = sageSchema.table("sales_order", {
  id: integer("id").primaryKey(),
  accountId: varchar("account_id")
    .notNull()
    .references(() => salesAccount.id),
  despatchDate: timestamp("despatch_date"),
  despatchStatus: varchar("despatch_status"),
  despatchStatusCode: smallint("despatch_status_code"),
  orderDate: timestamp("order_date"),
  orderOrQuote: varchar("order_or_quote"),
  orderTypeCode: smallint("order_type_code"),
  modifyDate: timestamp("modify_date").notNull(),
});

export const salesOrderRelations = relations(salesOrder, ({ one, many }) => ({
  account: one(salesAccount, {
    fields: [salesOrder.accountId],
    references: [salesAccount.id],
  }),
  items: many(salesOrderItem),
}));

export const salesOrderItem = sageSchema.table("sales_order_item", {
  id: integer("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => salesOrder.id),
  componentId: varchar("component_id")
    .notNull()
    .references(() => stockComponent.id),
  deliveryDate: timestamp("delivery_date"),
  dueDate: timestamp("due_date"),
  quantityAllocated: decimal("quantity_allocated"),
  quantityDelivered: decimal("quantity_delivered"),
  quantityDespatch: decimal("quantity_despatch"),
  quantityOrder: decimal("quantity_order"),
  modifyDate: timestamp("modify_date"),
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

export const purchaseAccount = sageSchema.table("purchase_account", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  modifyDate: timestamp("modify_date").notNull(),
});

export const purchaseAccountRelations = relations(
  purchaseAccount,
  ({ many }) => ({
    orders: many(purchaseOrder),
  }),
);

export const purchaseOrder = sageSchema.table("purchase_order", {
  id: integer("id").primaryKey(),
  accountId: varchar("account_id")
    .notNull()
    .references(() => purchaseAccount.id),
  orderOrQuote: varchar("order_or_quote"),
  orderDate: timestamp("order_date"),
  deliveryDate: timestamp("delivery_date"),
  orderStatusCode: smallint("order_status_code"),
  orderStatus: varchar("order_status"),
  deliveryStatusCode: smallint("delivery_status_code"),
  deliveryStatus: varchar("delivery_status"),
  modifyDate: timestamp("modify_date").notNull(),
});

export const purchaseOrderRelations = relations(
  purchaseOrder,
  ({ one, many }) => ({
    account: one(purchaseAccount, {
      fields: [purchaseOrder.accountId],
      references: [purchaseAccount.id],
    }),
    items: many(purchaseOrderItem),
  }),
);

export const purchaseOrderItem = sageSchema.table("purchase_order_item", {
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
