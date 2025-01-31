import {
  doublePrecision,
  integer,
  pgSchema,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

const bitSystemsSchema = pgSchema("bit_systems");

const binItem = bitSystemsSchema.table("bin_item", {
  pk_BinItem_ID: integer("pk_BinItem_ID").primaryKey(),
  fk_StockItem_ID: integer("fk_StockItem_ID"),
  fk_Bin_ID: integer("fk_Bin_ID"),
  QuantityInStock: doublePrecision("QuantityInStock"),
  QuantityAllocated: doublePrecision("QuantityAllocated"),
  DateTimeCreated: timestamp("DateTimeCreated"),
  LastUpdated: timestamp("LastUpdated"),
  Priority: smallint("Priority"),
});

const bin = bitSystemsSchema.table("bin", {
  pk_Bin_ID: integer("pk_Bin_ID").primaryKey(),
  fk_Warehouse_ID: integer("fk_Warehouse_ID"),
  Name: varchar("Name", { length: 255 }),
  IsUnspecifiedBin: integer("IsUnspecifiedBin"),
  DateTimeCreated: timestamp("DateTimeCreated"),
  LastUpdated: timestamp("LastUpdated"),
  Sequence: integer("Sequence"),
});

const stockItem = bitSystemsSchema.table("stock_item", {
  pk_StockItem_ID: integer("pk_StockItem_ID").primaryKey(),
  Code: varchar("Code", { length: 255 }),
  DateTimeCreated: timestamp("DateTimeCreated"),
  DeletedOn: timestamp("DeletedOn"),
  Description: varchar("Description", { length: 255 }),
  CategoryNo: integer("CategoryNo"),
  CategoryName: varchar("CategoryName", { length: 255 }),
  UnitWeight: doublePrecision("UnitWeight"),
  Barcode: varchar("Barcode", { length: 255 }),
  SupplierCode: varchar("SupplierCode", { length: 255 }),
  SupplierName: varchar("SupplierName", { length: 255 }),
  PartNo: varchar("PartNo", { length: 255 }),
  DepartmentCode: integer("DepartmentCode"),
  DepartmentName: varchar("DepartmentName", { length: 255 }),
  CustomField1: varchar("CustomField1", { length: 255 }),
  CustomField2: varchar("CustomField2", { length: 255 }),
  CustomField3: varchar("CustomField3", { length: 255 }),
  TraceableItemTypeID: integer("TraceableItemTypeID"),
  IgnoreStockLevel: integer("IgnoreStockLevel"),
});

const traceableBinItem = bitSystemsSchema.table("traceable_bin_item", {
  pk_TraceableBinItem_ID: integer("pk_TraceableBinItem_ID").primaryKey(),
  fk_TraceableItem_ID: integer("fk_TraceableItem_ID"),
  fk_BinItem_ID: integer("fk_BinItem_ID"),
  QuantityInStock: doublePrecision("QuantityInStock"),
  QuantityAllocated: doublePrecision("QuantityAllocated"),
  DateTimeCreated: timestamp("DateTimeCreated"),
});

const traceableItem = bitSystemsSchema.table("traceable_item", {
  pk_TraceableItem_ID: integer("pk_TraceableItem_ID").primaryKey(),
  fk_StockItem_ID: integer("fk_StockItem_ID"),
  fk_TraceableType_ID: integer("fk_TraceableType_ID"),
  IdentificationNo: varchar("IdentificationNo", { length: 255 }),
  AlternativeRef: varchar("AlternativeRef", { length: 255 }),
  Notes: varchar("Notes", { length: 255 }),
  SellByDate: timestamp("SellByDate"),
  UseByDate: timestamp("UseByDate"),
  DateTimeCreated: timestamp("DateTimeCreated"),
  LastUpdated: timestamp("LastUpdated"),
});

const warehouse = bitSystemsSchema.table("warehouse", {
  pk_Warehouse_ID: integer("pk_Warehouse_ID").primaryKey(),
  Name: varchar("Name", { length: 255 }),
  Description: varchar("Description", { length: 255 }),
});

export default {
  binItem,
  bin,
  stockItem,
  traceableBinItem,
  traceableItem,
  warehouse,
};
