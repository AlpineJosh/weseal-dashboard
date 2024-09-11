CREATE SCHEMA "bit_systems";
--> statement-breakpoint
ALTER SCHEMA "SAGE" RENAME TO "sage";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bit_systems"."bin" (
	"pk_Bin_ID" integer,
	"fk_Warehouse_ID" integer,
	"Name" varchar(255),
	"IsUnspecifiedBin" integer,
	"DateTimeCreated" timestamp,
	"LastUpdated" timestamp,
	"Sequence" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bit_systems"."bin_item" (
	"pk_BinItem_ID" integer,
	"fk_StockItem_ID" integer,
	"fk_Bin_ID" integer,
	"QuantityInStock" double precision,
	"QuantityAllocated" double precision,
	"DateTimeCreated" timestamp,
	"LastUpdated" timestamp,
	"Priority" smallint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bit_systems"."stock_item" (
	"pk_StockItem_ID" integer,
	"Code" varchar(255),
	"DateTimeCreated" timestamp,
	"DeletedOn" timestamp,
	"Description" varchar(255),
	"CategoryNo" integer,
	"CategoryName" varchar(255),
	"UnitWeight" double precision,
	"Barcode" varchar(255),
	"SupplierCode" varchar(255),
	"SupplierName" varchar(255),
	"PartNo" varchar(255),
	"DepartmentCode" integer,
	"DepartmentName" varchar(255),
	"CustomField1" varchar(255),
	"CustomField2" varchar(255),
	"CustomField3" varchar(255),
	"TraceableItemTypeID" integer,
	"IgnoreStockLevel" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bit_systems"."traceable_bin_item" (
	"pk_TraceableBinItem_ID" integer,
	"fk_TraceableItem_ID" integer,
	"fk_BinItem_ID" integer,
	"QuantityInStock" double precision,
	"QuantityAllocated" double precision,
	"DateTimeCreated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bit_systems"."traceable_item" (
	"pk_TraceableItem_ID" integer,
	"fk_StockItem_ID" integer,
	"fk_TraceableType_ID" integer,
	"IdentificationNo" varchar(255),
	"AlternativeRef" varchar(255),
	"Notes" varchar(255),
	"SellByDate" timestamp,
	"UseByDate" timestamp,
	"DateTimeCreated" timestamp,
	"LastUpdated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bit_systems"."warehouse" (
	"pk_Warehouse_ID" integer,
	"Name" varchar(255),
	"Description" varchar(255)
);
