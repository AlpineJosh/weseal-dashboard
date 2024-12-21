import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgTable,
  real,
  serial,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { numericDecimal } from "../../lib/numeric";
import {
  componentCategory,
  department,
  subcomponent,
} from "../public/component.schema";
import {
  batch,
  batchMovement,
  batchMovementType,
  location,
} from "../public/inventory.schema";

export const batchLocationQuantity = pgTable("batch_location_quantity", {
  componentId: varchar("component_id").notNull(),
  componentDescription: varchar("component_description").notNull(),
  isTracked: boolean("tracked").notNull(),
  componentUnit: varchar("component_unit"),
  batchId: integer("batch_id").notNull(),
  batchReference: varchar("batch_reference"),
  batchEntryDate: date("batch_entry_date", { mode: "date" }),
  locationId: integer("location_id").notNull(),
  locationName: varchar("location_name").notNull(),
  total: numericDecimal("total").notNull(),
  allocated: numericDecimal("allocated").notNull(),
  free: numericDecimal("free").notNull(),
});

export const batchLocationQuantityRelations = relations(
  batchLocationQuantity,
  ({ one }) => ({
    location: one(location, {
      fields: [batchLocationQuantity.locationId],
      references: [location.id],
    }),
    batch: one(batch, {
      fields: [batchLocationQuantity.batchId],
      references: [batch.id],
    }),
    component: one(componentOverview, {
      fields: [batchLocationQuantity.componentId],
      references: [componentOverview.id],
    }),
  }),
);

export const componentOverview = pgTable("component_overview", {
  id: varchar("id").notNull(),
  description: varchar("description").notNull(),
  hasSubcomponents: boolean("has_subcomponents").notNull(),
  totalQuantity: numericDecimal("total_quantity").notNull(),
  allocatedQuantity: numericDecimal("allocated_quantity").notNull(),
  freeQuantity: numericDecimal("free_quantity").notNull(),
  sageQuantity: numericDecimal("sage_quantity").notNull(),
  sageDiscrepancy: numericDecimal("sage_discrepancy").notNull(),
  unit: varchar("unit"),
  categoryId: smallint("category_id"),
  categoryName: varchar("category_name"),
  departmentId: integer("department_id"),
  departmentName: varchar("department_name"),
  isTraceable: boolean("traceable"),
  isTracked: boolean("tracked"),
  defaultLocationId: integer("default_location_id"),
  requiresQualityCheck: boolean("requires_quality_check"),
  qualityCheckDetails: varchar("quality_check_details"),
  createdAt: timestamp("created_at").notNull(),
  lastModified: timestamp("last_modified").notNull(),
  isDeleted: boolean("is_deleted").notNull(),
});

export const componentOverviewRelations = relations(
  componentOverview,
  ({ one, many }) => ({
    subcomponents: many(subcomponent, {
      relationName: "subcomponentComponentOverview",
    }),
    department: one(department, {
      fields: [componentOverview.departmentId],
      references: [department.id],
    }),
    category: one(componentCategory, {
      fields: [componentOverview.categoryId],
      references: [componentCategory.id],
    }),
    batches: many(batch),
    defaultLocation: one(location, {
      fields: [componentOverview.defaultLocationId],
      references: [location.id],
    }),
    locations: many(batchLocationQuantity),
  }),
);

export const batchOverview = pgTable("batch_overview", {
  id: integer("id").notNull(),
  componentId: varchar("component_id"),
  componentDescription: varchar("component_description"),
  batchReference: varchar("batch_reference"),
  entryDate: date("entry_date", { mode: "date" }),
  totalQuantity: numericDecimal("total_quantity"),
  freeQuantity: numericDecimal("free_quantity"),
  unit: varchar("unit"),
  categoryId: integer("category_id"),
  departmentId: integer("department_id"),
  isTraceable: boolean("traceable"),
  isTracked: boolean("tracked"),
});

export const batchOverviewRelations = relations(
  batchOverview,
  ({ one, many }) => ({
    component: one(componentOverview, {
      fields: [batchOverview.componentId],
      references: [componentOverview.id],
    }),
    movements: many(batchMovement),
    locations: many(batchLocationQuantity),
  }),
);

export const subcomponentOverview = pgTable("subcomponent_overview", {
  componentId: varchar("component_id").notNull(),
  subcomponentId: varchar("subcomponent_id").notNull(),
  quantity: numericDecimal("quantity").notNull(),
  subcomponentDescription: varchar("subcomponent_description"),
  subcomponentTotalQuantity: numericDecimal(
    "subcomponent_total_quantity",
  ).notNull(),
  subcomponentAllocatedQuantity: numericDecimal(
    "subcomponent_allocated_quantity",
  ).notNull(),
  subcomponentFreeQuantity: numericDecimal(
    "subcomponent_free_quantity",
  ).notNull(),
  subcomponentSageQuantity: numericDecimal(
    "subcomponent_sage_quantity",
  ).notNull(),
  subcomponentSageDiscrepancy: numericDecimal(
    "subcomponent_sage_discrepancy",
  ).notNull(),
  subcomponentUnit: varchar("subcomponent_unit"),
  subcomponentCategoryId: smallint("subcomponent_category_id"),
  subcomponentDepartmentId: integer("subcomponent_department_id"),
});

export const batchMovementOverview = pgTable("batch_movement_overview", {
  id: serial("id").notNull(),
  date: date("date", { mode: "date" }).notNull(),
  batchId: integer("batch_id"),
  batchReference: varchar("batch_reference"),
  batchEntryDate: date("batch_entry_date", { mode: "date" }),
  componentId: varchar("component_id"),
  componentDescription: varchar("component_description"),
  componentUnit: varchar("component_unit"),
  locationId: integer("location_id"),
  locationName: varchar("location_name"),
  locationGroupId: integer("location_group_id"),
  locationGroupName: varchar("location_group_name"),
  quantity: numericDecimal("quantity"),
  userId: varchar("user_id"),
  type: batchMovementType("type"),
  purchaseReceiptItemId: integer("purchase_receipt_item_id"),
  purchaseOrderId: integer("purchase_order_id"),
  supplierId: integer("supplier_id"),
  supplierName: varchar("supplier_name"),
  salesDespatchItemId: integer("sales_despatch_item_id"),
  salesOrderId: integer("sales_order_id"),
  customerId: integer("customer_id"),
  customerName: varchar("customer_name"),
  productionBatchInputId: integer("production_batch_input_id"),
  productionBatchOutputId: integer("production_batch_output_id"),
  productionJobId: integer("production_job_id"),
  productionJobBatchReference: varchar("production_job_batch_reference"),
});

export const batchMovementCorrectionOverview = pgTable(
  "batch_movement_correction_overview",
  {
    id: integer("id"),
    correctionMovementId: integer("correction_movement_id"),
    correctedMovementId: integer("corrected_movement_id"),
    batchId: integer("batch_id"),
    batchReference: varchar("batch_reference"),
    componentId: varchar("component_id"),
    componentDescription: varchar("component_description"),
    locationId: integer("location_id"),
    locationName: varchar("location_name"),
    fromQuantity: numericDecimal("from_quantity"),
    toQuantity: numericDecimal("to_quantity"),
  },
);

export const taskOverview = pgTable("task_overview", {
  id: integer("id"),
  type: batchMovementType("type"),
  itemCount: integer("item_count"),
  incompleteItemCount: integer("incomplete_item_count"),
  isComplete: boolean("is_complete"),
  isCancelled: boolean("is_cancelled"),
  assignedToId: varchar("assigned_to_user_id"),
  assignedToName: varchar("assigned_to_name"),
  createdById: varchar("created_by_user_id"),
  createdByName: varchar("created_by_name"),
  customerId: integer("customer_id"),
  customerName: varchar("customer_name"),
  salesOrderId: integer("sales_order_id"),
  salesDespatchId: integer("sales_despatch_id"),
  salesDespatchDate: date("sales_despatch_date", { mode: "date" }),
  productionJobId: integer("production_job_id"),
  productionJobBatchReference: varchar("production_job_batch_reference"),
  productionJobOuputComponentId: varchar("production_job_output_component_id"),
  productionJobOuputComponentDescription: varchar(
    "production_job_output_component_description",
  ),
});

export const taskItemOverview = pgTable("task_item_overview", {
  id: integer("id"),
  taskId: integer("task_id"),
  batchId: integer("batch_id"),
  batchReference: varchar("batch_reference"),
  componentId: varchar("component_id"),
  componentDescription: varchar("component_description"),
  componentUnit: varchar("component_unit"),
  pickLocationId: integer("pick_location_id"),
  pickLocationName: varchar("pick_location_name"),
  pickLocationGroupId: integer("pick_location_group_id"),
  pickLocationGroupName: varchar("pick_location_group_name"),
  putLocationId: integer("put_location_id"),
  putLocationName: varchar("put_location_name"),
  putLocationGroupId: integer("put_location_group_id"),
  putLocationGroupName: varchar("put_location_group_name"),
  quantity: numericDecimal("quantity"),
  isComplete: boolean("is_complete"),
});

export const locationOverview = pgTable("location_overview", {
  id: integer("id").notNull(),
  name: varchar("name").notNull(),
  details: varchar("details"),
  groupId: integer("group_id"),
  groupName: varchar("group_name"),
  typeId: integer("type_id"),
  typeName: varchar("type_name"),
  isPickable: boolean("is_pickable"),
  isTransient: boolean("is_transient"),
});

export const customerOverview = pgTable("customer_overview", {
  id: varchar("id"),
  name: varchar("name"),
  orderCount: integer("order_count").notNull(),
  openOrderCount: integer("open_order_count").notNull(),
  nextExpectedDespatch: timestamp("next_expected_despatch").notNull(),
});

export const salesOrderOverview = pgTable("sales_order_overview", {
  id: integer("id").notNull(),
  customerId: varchar("customer_id").notNull(),
  customerName: varchar("customer_name").notNull(),
  orderDate: timestamp("order_date"),
  isQuote: boolean("is_quote"),
  isCancelled: boolean("is_cancelled"),
  isComplete: boolean("is_complete"),
  nextExpectedDespatch: timestamp("next_expected_despatch"),
  despatchCount: integer("despatch_count"),
  itemCount: integer("item_count"),
  remainingItemCount: integer("remaining_item_count"),
});

export const salesOrderItemOverview = pgTable("sales_order_item_overview", {
  id: integer("id").notNull(),
  orderId: integer("order_id").notNull(),
  componentId: varchar("component_id").notNull(),
  componentDescription: varchar("component_description").notNull(),
  quantityOrdered: real("quantity_ordered").notNull(),
  quantityDespatched: numericDecimal("quantity_despatched"),
  quantityInStock: numericDecimal("quantity_in_stock"),
  sageQuantityDespatched: numericDecimal("sage_quantity_despatched"),
});

export const salesDespatchOverview = pgTable("sales_despatch_overview", {
  id: integer("id").notNull(),
  orderId: integer("order_id").notNull(),
  customerId: varchar("customer_id").notNull(),
  customerName: varchar("customer_name").notNull(),
  expectedDespatchDate: timestamp("expected_despatch_date"),
  despatchDate: timestamp("despatch_date"),
  isDespatched: boolean("is_despatched"),
  itemCount: integer("item_count"),
});

export const salesDespatchItemOverview = pgTable(
  "sales_despatch_item_overview",
  {
    id: integer("id").notNull(),
    despatchId: integer("despatch_id").notNull(),
    batchId: integer("batch_id"),
    batchReference: varchar("batch_reference"),
    componentId: varchar("component_id").notNull(),
    componentDescription: varchar("component_description").notNull(),
    quantity: real("quantity"),
  },
);

export const productionJobOverview = pgTable("production_job_overview", {
  id: integer("id").notNull(),
  outputComponentId: varchar("output_component_id").notNull(),
  outputComponentDescription: varchar("output_component_description").notNull(),
  batchNumber: varchar("batch_number"),
  outputLocationId: integer("output_location_id").notNull(),
  outputLocationName: varchar("output_location_name").notNull(),
  targetQuantity: integer("target_quantity").notNull(),
  outputQuantity: real("output_quantity").notNull(),
  remainingInputTasks: integer("remaining_input_tasks").notNull(),
});

export const productionBatchInputOverview = pgTable(
  "production_batch_input_overview",
  {
    id: integer("id"),
    jobId: integer("job_id"),
    batchId: integer("batch_id"),
    batchReference: varchar("batch_reference"),
    componentId: varchar("component_id"),
    componentDescription: varchar("component_description"),
    quantityAllocated: real("quantity_allocated"),
    quantityUsed: real("quantity_used"),
    locationId: integer("location_id"),
    locationName: varchar("location_name"),
  },
);

export const productionBatchOutputOverview = pgTable(
  "production_batch_output_overview",
  {
    id: integer("id"),
    jobId: integer("job_id"),
    batchId: integer("batch_id"),
    batchReference: varchar("batch_reference"),
    componentId: varchar("component_id"),
    componentDescription: varchar("component_description"),
    productionQuantity: real("production_quantity"),
    productionDate: timestamp("production_date"),
  },
);

export const supplierOverview = pgTable("supplier_overview", {
  id: varchar("id"),
  name: varchar("name"),
  orderCount: integer("order_count"),
  openOrderCount: integer("open_order_count"),
  nextExpectedReceipt: timestamp("next_expected_receipt"),
});

export const purchaseOrderOverview = pgTable("purchase_order_overview", {
  id: integer("id").notNull(),
  supplierId: varchar("supplier_id").notNull(),
  supplierName: varchar("supplier_name").notNull(),
  orderDate: timestamp("order_date"),
  isQuote: boolean("is_quote"),
  isCancelled: boolean("is_cancelled"),
  itemCount: integer("item_count"),
  remainingItemCount: integer("remaining_item_count"),
  nextExpectedReceipt: timestamp("next_expected_receipt"),
  receiptCount: integer("receipt_count"),
  receivedReceiptCount: integer("received_receipt_count"),
});

export const purchaseOrderItemOverview = pgTable(
  "purchase_order_item_overview",
  {
    id: integer("id").notNull(),
    orderId: integer("order_id").notNull(),
    componentId: varchar("component_id").notNull(),
    componentDescription: varchar("component_description").notNull(),
    quantityOrdered: real("quantity_ordered").notNull(),
    quantityReceived: real("quantity_received"),
    sageQuantityReceived: real("sage_quantity_received"),
  },
);

export const purchaseReceiptOverview = pgTable("purchase_receipt_overview", {
  id: integer("id").notNull(),
  orderId: integer("order_id").notNull(),
  supplierId: varchar("supplier_id").notNull(),
  supplierName: varchar("supplier_name").notNull(),
  expectedReceiptDate: timestamp("expected_receipt_date"),
  receiptDate: timestamp("receipt_date"),
  isReceived: boolean("is_received"),
  itemCount: integer("item_count"),
});

export const purchaseReceiptItemOverview = pgTable(
  "purchase_receipt_item_overview",
  {
    id: integer("id").notNull(),
    receiptId: integer("receipt_id").notNull(),
    batchId: integer("batch_id"),
    batchReference: varchar("batch_reference"),
    componentId: varchar("component_id").notNull(),
    componentDescription: varchar("component_description").notNull(),
    quantity: real("quantity").notNull(),
  },
);
