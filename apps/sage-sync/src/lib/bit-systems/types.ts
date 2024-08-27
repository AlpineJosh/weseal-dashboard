export type Warehouse = {
  pk_Warehouse_ID: number;
  Name: string;
  Description: string | null;
};

export type Bin = {
  pk_Bin_ID: number;
  fk_Warehouse_ID: number;
  Name: string;
  IsUnspecifiedBin: number;
  DateTimeCreated: string;
  LastUpdated: string;
  Sequence: string | null;
};

export type BinItem = {
  pk_BinItem_ID: number;
  fk_StockItem_ID: number;
  fk_Bin_ID: number;
  QuantityInStock: number;
  QuantityAllocated: number;
  DateTimeCreated: string;
  LastUpdated: string;
  Priority: number;
};

export type StockItem = {
  pk_StockItem_ID: number;
  Code: string;
  DateTimeCreated: string;
  DeletedOn: string | null;
  Description: string;
  CategoryNo: number;
  CategoryName: string;
  UnitWeight: number;
  Barcode: string;
  SupplierCode: string;
  SupplierName: string;
  PartNo: string;
  DepartmentCode: number;
  DepartmentName: string;
};

export type TraceableItem = {
  pk_TraceableItem_ID: number;
  fk_StockItem_ID: number;
  fk_TraceableType_ID: number;
  IdentificationNo: string;
  AlternativeRef: string | null;
  Notes: string | null;
  SellByDate: string | null;
  UseByDate: string | null;
  DateTimeCreated: string;
  LastUpdated: string;
};

export type TraceableBinItem = {
  pk_TraceableBinItem_ID: number;
  fk_TraceableItem_ID: number;
  fk_BinItem_ID: number;
  QuantityInStock: number;
  QuantityAllocated: number;
  DateTimeCreated: string;
};
