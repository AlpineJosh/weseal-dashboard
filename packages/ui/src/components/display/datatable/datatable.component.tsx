"use client";

import type Decimal from "decimal.js";
import { format } from "date-fns";

import { faFilter } from "@repo/pro-light-svg-icons";
import { cn } from "@repo/ui/lib/class-merge";

import type { CellProps, ColumnSort, TableProps } from "../table";
import { Input, Select } from "../../control";
import { Button, Icon } from "../../element";
import { Pagination } from "../../navigation";
import { Table } from "../table";

export interface DatatablePaginationValue {
  page: number;
  size: number;
  total: number;
}

export interface DatatablePaginationInput {
  page: number;
  size: number;
}

export interface DatatableSearchValue<TData> {
  query: string;
  fields?: (keyof TData)[];
}

export interface DatatableFilterValue<TData> {
  field: keyof TData;
  value: string;
}

export interface DatatableDataProps<TData> {
  data?: TData[];
  isLoading?: boolean;
  searchValue?: DatatableSearchValue<TData>;
  paginationValue?: DatatablePaginationValue;
  sortValue?: ColumnSort[];
  filterValue?: DatatableFilterValue<TData>[];
  onSearchChange?: (search: DatatableSearchValue<TData>) => void;
  onPaginationChange?: (pagination: DatatablePaginationInput) => void;
  onSortChange?: (...columns: ColumnSort[]) => void;
  onFilterChange?: (filter: DatatableFilterValue<TData>[]) => void;
}

export type DatatableProps<TData extends object> = DatatableDataProps<TData> &
  TableProps;

const Root = <TData extends object>({
  data,
  isLoading,
  searchValue,
  onSearchChange,
  paginationValue = { page: 1, size: 10, total: 0 },
  sortValue,
  onPaginationChange,
  onSortChange,
  className,
  children,
}: DatatableProps<TData>) => {
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="flex flex-row items-center justify-between gap-x-2">
        <Input
          type="search"
          placeholder="Search"
          value={searchValue?.query ?? ""}
          onChange={(e) => {
            onSearchChange?.({ query: e.target.value });
          }}
        />
        <Button variant="input">
          <Icon icon={faFilter} />
          Filter
        </Button>
      </div>
      <Table
        sortValue={sortValue}
        onSortChange={onSortChange}
        isLoading={isLoading}
        skeletonRows={paginationValue.size}
      >
        {children}
      </Table>

      <div
        className={cn(
          "flex flex-row items-center justify-between space-x-2 p-2",
          !isLoading && data?.length === 0 && "hidden",
        )}
      >
        <Select
          value={paginationValue.size}
          onChange={(key) => {
            onPaginationChange?.({
              ...paginationValue,
              size: key as number,
            });
          }}
          items={[
            { key: 10, label: "10" },
            { key: 20, label: "20" },
            { key: 50, label: "50" },
            { key: 100, label: "100" },
          ]}
          aria-label="Page size"
        >
          {(item) => (
            <Select.Option id={item.key} key={item.key}>
              {item.label}
            </Select.Option>
          )}
        </Select>
        <Pagination
          currentPage={paginationValue.page}
          totalPages={Math.ceil(paginationValue.total / paginationValue.size)}
          onPageChange={(page) => {
            onPaginationChange?.({
              ...paginationValue,
              page,
            });
          }}
          href={undefined}
        />
      </div>
    </div>
  );
};

export type DecimalCellProps = CellProps & {
  value: Decimal;
  precision?: number;
  unit?: string | null;
};

const DecimalCell = ({
  precision = 2,
  unit,
  value,
  className,
  ...props
}: DecimalCellProps) => {
  return (
    <Table.Cell
      {...props}
      className={cn("flex flex-row items-baseline space-x-1", className)}
    >
      <span className="grow text-right tabular-nums">
        {value.toFixed(precision)}
      </span>
      {unit !== undefined && (
        <span className="flex-0 w-12 truncate text-left text-xs text-content-muted">
          {unit}
        </span>
      )}
    </Table.Cell>
  );
};

export type DateTimeCellProps = CellProps & {
  value: Date;
  includeTime?: boolean;
};

const DateTimeCell = ({ value, includeTime, ...props }: DateTimeCellProps) => {
  const dateFormat = includeTime ? "yy/MM/dd h:mm a" : "yy-MM-dd";
  const date = format(value, dateFormat);
  return <Table.Cell {...props}>{date}</Table.Cell>;
};

export const Datatable = Object.assign(Root, {
  Head: Table.Head,
  Body: Table.Body,
  Column: Table.Column,
  Row: Table.Row,
  Cell: Table.Cell,
  DecimalCell,
  DateTimeCell,
});
