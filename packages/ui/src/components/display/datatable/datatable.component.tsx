"use client";

import { ReactNode, useEffect } from "react";
import { useImmer } from "use-immer";

import {
  faChevronLeft,
  faChevronRight,
  faEllipsis,
} from "@repo/pro-solid-svg-icons";
import { AsyncData } from "@repo/ui/lib/async";

import { Select } from "../../control";
import { Button, Icon } from "../../element";
import { Table } from "../table";

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
  // field: keyof TData;
  order: "asc" | "desc";
};

type DataQueryInput<TData extends object> = {
  pagination?: DataPagination;
  // sort?: DataSort<TData>[];
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

export type DatatableProps<TData extends object> = {
  columns: DatatableColumn<TData>[];
  data: TData[] | DataEndpoint<TData>;
  filter?: any;
};

export const Datatable = <TData extends object>({
  columns,
  data: dataFn,
  filter,
}: DatatableProps<TData>) => {
  const [queryInput, setQueryInput] = useImmer<DataQueryInput<TData>>({});

  const { data, isLoading } = useData(dataFn, { ...queryInput, filter });

  const { rows, pagination, sort } = data || {
    rows: [],
    pagination: { page: 1, size: 10, total: 0 },
    sort: [],
  };
  const totalPages = Math.ceil(pagination.total / pagination.size);
  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - pagination.page) <= 2) {
        pages.push(
          <Button
            key={i}
            onPress={() => {
              setQueryInput((draft) => {
                draft.pagination = {
                  page: i,
                  size: pagination.size,
                };
              });
            }}
            isDisabled={i === pagination.page}
          >
            {i}
          </Button>,
        );
      } else if (i === pagination.page - 3 || i === pagination.page + 3) {
        pages.push(<Icon key={i} icon={faEllipsis} />);
      }
    }
    return pages;
  };
  return (
    <div>
      <Table>
        <Table.Header>
          <Table.Row>
            {columns.map((column) => (
              <Table.Head key={column.label}>{column.label}</Table.Head>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            Array.from({ length: queryInput.pagination?.size || 10 }).map(
              (_, index) => (
                <Table.Row key={index}>
                  {columns.map((column) => (
                    <Table.Cell key={column.label}>
                      <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
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
              <Table.Cell colSpan={columns.length}>No data</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      <div className="flex flex-row items-center justify-between space-x-2 p-2">
        <Select
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
        </Select>
        <div className="flex flex-row items-center space-x-2">
          <Button
            variant="ghost"
            onPress={() => {
              setQueryInput((draft) => {
                draft.pagination = {
                  page: Math.max(pagination.page - 1, 1),
                  size: pagination.size,
                };
              });
            }}
          >
            <Icon icon={faChevronLeft} />
          </Button>
          {renderPageNumbers()}
          <Button
            variant="ghost"
            onPress={() => {
              setQueryInput((draft) => {
                draft.pagination = {
                  page: Math.min(pagination.page + 1, totalPages),
                  size: pagination.size,
                };
              });
            }}
          >
            <Icon icon={faChevronRight} />
          </Button>
        </div>
      </div>
    </div>
  );
};
