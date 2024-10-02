"use client";

import React, {
  ComponentPropsWithRef,
  PropsWithChildren,
  PropsWithRef,
  ReactNode,
  useEffect,
} from "react";
import * as Aria from "react-aria-components";
import { Checkbox } from "react-aria-components";
import { useImmer } from "use-immer";

import { faSort } from "@repo/pro-light-svg-icons";
import { AsyncData } from "@repo/ui/lib/async";

import { Input } from "../../control";
import { Button, Icon, Menu } from "../../element";
import { Pagination, PaginationProps } from "../../navigation";
import {
  Table,
  TableColumnProps,
  TableHeaderProps,
  TableProps,
  TableRowProps,
} from "../table";
import { DatatableProvider, useDatatableContext } from "./datatable.context";

type Accessor<TData> = keyof TData | ((row: TData) => any);

type DatatableColumn<TData extends object> = {
  label: string;
  accessor: Accessor<TData>;
  cell?: (row: TData) => ReactNode;
};

type DataPagination = {
  page: number;
  size: number;
};

type DataSort<TData extends object> = {
  field: keyof TData;
  order: "asc" | "desc";
};

type DataQueryInput<TData extends object> = {
  pagination?: DataPagination;
  sort?: DataSort<TData>[];
  filter?: any;
  search?: any;
};

type DataQueryResponse<TData extends object> = {
  rows: TData[];
  pagination: DataPagination & { total: number };
  sort: DataSort<TData>[];
};

type DataEndpoint<TData extends object> = (
  input: DataQueryInput<TData>,
  ...args: any[]
) => AsyncData<DataQueryResponse<TData>>;

function useData<
  TData extends object,
  TQueryInput extends DataQueryInput<TData>,
>(
  data: TData[] | DataEndpoint<TData>,
  queryInput: TQueryInput,
): AsyncData<DataQueryResponse<TData>> {
  if (typeof data === "function") {
    return data(queryInput);
  }

  return {
    data: {
      rows: data,
      pagination: { page: 1, size: data.length, total: data.length },
      sort: [],
    },
    isLoading: false,
    error: undefined,
  };
}

type DatatableProps<
  TData extends object,
  TEndpoint extends DataEndpoint<TData>,
> = {
  columns: DatatableColumn<TData>[];
  data: TEndpoint;
  filter?: any;
} & ComponentPropsWithRef<"div">;

export const Datatable = <
  TData extends object,
  TEndpoint extends DataEndpoint<TData> = DataEndpoint<TData>,
>({
  columns,
  data: dataFn,
  filter,
}: DatatableProps<TData, TEndpoint>) => {
  const [queryInput, setQueryInput] = useImmer<DataQueryInput<TData>>({
    pagination: { page: 1, size: 10 },
    sort: [],
  });

  const { data, isLoading } = useData(dataFn, { ...queryInput });

  const { rows, pagination, sort } = data || {
    rows: [],
    pagination: { page: 1, size: 10, total: 0 },
    sort: [],
  };
  const totalPages = Math.ceil(pagination.total / pagination.size);

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center justify-between px-4 py-2">
        <Input type="search" placeholder="Search" />
      </div>
      <Table>
        <Table.Header>
          {columns.map((column) => (
            <Table.Column isRowHeader key={column.label}>
              <div className="flex flex-row items-center justify-between">
                <span className="whitespace-nowrap">{column.label}</span>
                <Button
                  variant="plain"
                  onPress={() => {
                    setQueryInput((draft) => {
                      draft.sort = [
                        {
                          field: column.accessor,
                          order:
                            sort.find((s) => s.field === column.accessor)
                              ?.order === "asc"
                              ? "desc"
                              : "asc",
                        },
                      ];
                    });
                  }}
                >
                  <Icon icon={faSort} />
                </Button>
              </div>
            </Table.Column>
          ))}
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            Array.from({ length: queryInput.pagination?.size || 10 }).map(
              (_, index) => (
                <Table.Row key={index}>
                  {columns.map((column) => (
                    <Table.Cell key={column.label}>
                      <div className="bg-muted h-4 w-full animate-pulse rounded-full" />
                    </Table.Cell>
                  ))}
                </Table.Row>
              ),
            )
          ) : rows.length > 0 ? (
            rows.map((row, index) => (
              <Table.Row key={index}>
                {columns.map((column) =>
                  column.cell ? (
                    column.cell(row)
                  ) : (
                    <Table.Cell key={column.label}>
                      {typeof column.accessor === "function"
                        ? String(column.accessor(row))
                        : String(row[column.accessor])}
                    </Table.Cell>
                  ),
                )}
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              {/* <Table.Cell colSpan={columns.length}>No data</Table.Cell> */}
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      <div className="flex flex-row items-center justify-between space-x-2 p-2">
        {/* <Select
          selectedKey={pagination.size}
          onSelectionChange={(key) => {
            setQueryInput((draft) => {
              draft.pagination = {
                page: 1,
                size: key as number,
              };
            });
          }}
          items={[
            { key: 10, label: "10" },
            { key: 20, label: "20" },
            { key: 50, label: "50" },
            { key: 100, label: "100" },
          ]}
        >
          {(item) => <Select.Option key={item.key}>{item.label}</Select.Option>}
        </Select> */}
        <Pagination
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.size)}
          onPageChange={(page) => {
            setQueryInput((draft) => {
              draft.pagination = draft.pagination
                ? { ...draft.pagination, page }
                : { page, size: 10 };
            });
          }}
          href={undefined}
        />
      </div>
    </div>
  );
};

const Root = <TData extends object, TEndpoint extends DataEndpoint<TData>>({
  children,
  data: dataFn,
  ...props
}: DatatableProps<TData, TEndpoint>) => {
  const [queryInput, setQueryInput] = useImmer<DataQueryInput<TData>>({
    pagination: { page: 1, size: 10 },
    sort: [],
    filter: {},
  });

  const { data, isLoading } = useData(dataFn, { ...queryInput });

  return (
    <DatatableProvider
      setQuery={setQueryInput}
      pagination={queryInput.pagination}
    >
      <div {...props}>{children}</div>
    </DatatableProvider>
  );
};

type DatatableColumnProps = TableColumnProps;

const Column = ({ children, ...props }: DatatableColumnProps) => {
  return (
    <Table.Column {...props}>
      {({ allowsSorting, sortDirection }) => (
        <>
          {children}
          {allowsSorting && (
            <span aria-hidden="true" className="sort-indicator">
              {sortDirection === "ascending" ? "▲" : "▼"}
            </span>
          )}
        </>
      )}
    </Table.Column>
  );
};

type DatatableHeaderProps<TData extends object> = TableHeaderProps<TData>;

const Header = <TData extends object>({
  columns,
  children,
  ...props
}: DatatableHeaderProps<TData>) => {
  const { selection } = useDatatableContext();

  return (
    <Table.Header {...props}>
      {selection?.behaviour === "toggle" && (
        <Table.Column>
          {selection?.mode === "multiple" && <Checkbox slot="selection" />}
        </Table.Column>
      )}
      <Aria.Collection items={columns}>{children}</Aria.Collection>
    </Table.Header>
  );
};

type DatatableRowProps<TData extends object> = TableRowProps<TData>;

const Row = <TData extends object>({
  children,
  columns,
  ...props
}: DatatableRowProps<TData>) => {
  const { selection } = useDatatableContext();

  return (
    <Table.Row {...props}>
      {selection?.behaviour === "toggle" && (
        <Table.Cell>
          <Checkbox slot="selection" />
        </Table.Cell>
      )}
      <Aria.Collection items={columns}>{children}</Aria.Collection>
    </Table.Row>
  );
};

type DatatablePaginationProps = ComponentPropsWithRef<"div">;

const Footer = ({ ...props }: DatatablePaginationProps) => {
  const { pagination, setQuery } = useDatatableContext();
  return (
    <div {...props}>
      <Pagination
        currentPage={pagination?.page || 1}
        totalPages={Math.ceil(
          pagination?.total || 0 / (pagination?.size || 10),
        )}
        onPageChange={(page) => {
          setQuery((draft) => {
            draft.pagination = { ...draft.pagination, page };
          });
        }}
        href={undefined}
      />
    </div>
  );
};

// export const Datatable = Object.assign(Root, {
//   Table: Table,
//   Column,
//   Header,
//   Row,
//   Body: Table.Body,
//   Cell: Table.Cell,
// });

export type {
  DatatableProps,
  DatatableColumnProps,
  DatatableHeaderProps,
  DatatableRowProps,
  DatatablePaginationProps,
};
