import { createContext } from "react";

import type { ColumnDefinition } from "./column.component";

export interface DatatablePagination {
  page: number;
  size: number;
  total?: number;
}

export type DatatableSortAccessor<TData extends object> =
  | keyof TData
  | ((data: TData) => string | number);

export type DatatableSort<TData extends object> = {
  field: DatatableSortAccessor<TData>;
  direction: "asc" | "desc" | undefined;
}[];

export type DatatableSelection = (string | number)[];

export interface DatatableState<TData extends object> {
  data: TData[];
  pagination: DatatablePagination;
  sort: DatatableSort<TData>;
  selection: DatatableSelection;
  isLoading: boolean;
}

export interface DatatableHelpers<TData extends object> {
  registerColumn: (column: ColumnDefinition<TData>) => void;
  onSortChange: (sort: DatatableSort<TData>) => void;
  onPaginationChange: (pagination: DatatablePagination) => void;
  onSelectionChange: (selection: DatatableSelection) => void;
}

export interface DatatableCellRenderProps<TData extends object> {
  data: TData;
  column: ColumnDefinition<TData>;
  helpers: DatatableHelpers<TData>;
}

export interface DatatableContextType<TData extends object> {
  state: DatatableState<TData>;
  helpers: DatatableHelpers<TData>;
  columns: Map<string, ColumnDefinition<TData>>;
}

export const DatatableContext = createContext<
  DatatableContextType<object> | undefined
>(undefined);
