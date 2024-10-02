"use client";

import React, {
  ComponentPropsWithRef,
  Fragment,
  ReactNode,
  useEffect,
} from "react";
import { api } from "@/utils/trpc/react";
import * as Aria from "react-aria-components";
import { useImmer } from "use-immer";

import { faFilter, faSort } from "@repo/pro-light-svg-icons";
import { AsyncData } from "@repo/ui/lib/async";

import { Checkbox, Input } from "../../control";
import { Button, Icon } from "../../element";
import { Pagination } from "../../navigation";
import { Table } from "../table";

type DatatableColumn<TData extends object> = {
  id: string;
  label: string;
  key?: keyof TData;
  sortable?: boolean;
  isRowHeader?: boolean;
  cell: (row: TData) => ReactNode;
};

type DataPaginationInput = {
  page: number;
  size: number;
};

type DataSortInput<TData extends object> = {
  field: keyof TData;
  order: "asc" | "desc";
};

type DataQueryInput<TData extends object> = {
  pagination?: DataPaginationInput;
  sort?: DataSortInput<TData>[];
};

type DataPaginationResponse = {
  page: number;
  size: number;
  total: number;
};

type DataSortResponse<TData extends object> = {
  field: keyof TData;
  order: "asc" | "desc";
};

type DataQueryResponse<TData extends object> = {
  rows: TData[];
  pagination: DataPaginationResponse;
  sort: DataSortResponse<TData>[];
};

type DataEndpoint<TData extends object> = (
  input: DataQueryInput<TData>,
) => AsyncData<DataQueryResponse<TData>> | undefined;

type DataSource<TData extends object> = TData[] | DataEndpoint<TData>;

function useData<
  TData extends object,
  TQueryInput extends DataQueryInput<TData>,
>(source: DataSource<TData>, initialQuery: TQueryInput = {} as TQueryInput) {
  const [query, setQuery] = useImmer<TQueryInput>(initialQuery);

  let data: DataQueryResponse<TData> | undefined;
  let isLoading: boolean;
  let error: Error | undefined;

  if (typeof source === "function") {
    const result = source(query);
    data = result?.data;
    isLoading = result?.isLoading || false;
    error = result?.error;
  } else {
    let setData: (draft: DataQueryResponse<TData>) => void;
    [data, setData] = useImmer<DataQueryResponse<TData>>({
      rows: [],
      pagination: {
        page: 1,
        size: 10,
        total: source.length,
        ...initialQuery.pagination,
      },
      sort: initialQuery.sort || [],
    });
    isLoading = false;
    error = undefined;

    useEffect(() => {
      const { pagination = { page: 1, size: 10 }, sort = [] } = query;

      const rows = source
        .slice(
          (pagination.page - 1) * pagination.size,
          pagination.page * pagination.size,
        )
        .sort((a, b) => {
          for (const sortField of sort) {
            const order = sortField.order;
            const aValue = a[sortField.field];
            const bValue = b[sortField.field];

            const orderFactor = order === "asc" ? 1 : -1;
            if (aValue < bValue) return -1 * orderFactor;
            if (aValue > bValue) return 1 * orderFactor;
          }
          return 0;
        });
      setData({
        pagination: {
          ...pagination,
          total: source.length,
        },
        sort,
        rows,
      });
    }, [source, query]);
  }

  return {
    query,
    setQuery,
    isLoading,
    rows: data?.rows || [],
    pagination: data?.pagination || { page: 1, size: 10, total: 0 },
    sort: data?.sort || [],
  };
}

type DatatableProps<TData extends object> = {
  columns: DatatableColumn<TData>[];
  data: DataSource<TData>;
  initialQuery?: DataQueryInput<TData>;
  selectionMode?: "single" | "multiple" | "none";
  selectionBehaviour?: "toggle" | "replace" | undefined;
} & ComponentPropsWithRef<"div">;

const Root = <TData extends object>({
  columns,
  data,
  initialQuery,
  selectionMode = "none",
  selectionBehaviour,
}: DatatableProps<TData>) => {
  const { rows, pagination, sort, isLoading, setQuery } = useData(
    data,
    initialQuery,
  );

  return (
    <div className="">
      <div className="flex flex-row items-center justify-between gap-x-2">
        <Input type="search" placeholder="Search" />
        <Button variant="input">
          <Icon icon={faFilter} />
          Filter
        </Button>
      </div>
      <Table
        selectionBehavior={selectionBehaviour}
        selectionMode={selectionMode}
      >
        <Table.Header>
          {selectionBehaviour === "toggle" && (
            <Table.Column>
              {selectionMode === "multiple" && <Checkbox slot="selection" />}
            </Table.Column>
          )}
          <Aria.Collection items={columns}>
            {(column) => (
              <Table.Column
                isRowHeader={column.isRowHeader}
                key={column.id}
                id={column.id}
              >
                <span className="whitespace-nowrap">{column.label}</span>
                {column.sortable && <Icon icon={faSort} />}
              </Table.Column>
            )}
          </Aria.Collection>
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            Array.from({ length: pagination.size }).map((_, index) => (
              <Table.Row key={index}>
                {columns.map((column) => (
                  <Table.Cell key={column.label}>
                    <div className="my-1 h-4 w-full animate-pulse rounded-full bg-content-muted" />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))
          ) : rows.length > 0 ? (
            rows.map((row, index) => (
              <Table.Row key={index}>
                {selectionBehaviour === "toggle" && (
                  <Table.Cell>
                    <Checkbox slot="selection" />
                  </Table.Cell>
                )}
                <Aria.Collection items={columns}>
                  {(column) => (
                    <Fragment key={column.id}>{column.cell(row)}</Fragment>
                  )}
                </Aria.Collection>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell>No data</Table.Cell>
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
            console.log(page);
            setQuery((draft) => {
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

// const Root = <TData extends object, TEndpoint extends DataEndpoint<TData>>({
//   children,
//   data: dataFn,
//   ...props
// }: DatatableProps<TData, TEndpoint>) => {
//   const [queryInput, setQueryInput] = useImmer<DataQueryInput<TData>>({
//     pagination: { page: 1, size: 10 },
//     sort: [],
//     filter: {},
//   });

//   const { data, isLoading } = useData(dataFn, { ...queryInput });

//   return (
//     <DatatableProvider
//       setQuery={setQueryInput}
//       pagination={queryInput.pagination}
//     >
//       <div {...props}>{children}</div>
//     </DatatableProvider>
//   );
// };

// type DatatableColumnProps = TableColumnProps;

// const Column = ({ children, ...props }: DatatableColumnProps) => {
//   return (
//     <Table.Column {...props}>
//       {({ allowsSorting, sortDirection }) => (
//         <>
//           {children}
//           {allowsSorting && (
//             <span aria-hidden="true" className="sort-indicator">
//               {sortDirection === "ascending" ? "▲" : "▼"}
//             </span>
//           )}
//         </>
//       )}
//     </Table.Column>
//   );
// };

// type DatatableHeaderProps<TData extends object> = TableHeaderProps<TData>;

// const Header = <TData extends object>({
//   columns,
//   children,
//   ...props
// }: DatatableHeaderProps<TData>) => {
//   const { selection } = useDatatableContext();

//   return (
//     <Table.Header {...props}>
//       {selection?.behaviour === "toggle" && (
//         <Table.Column>
//           {selection?.mode === "multiple" && <Checkbox slot="selection" />}
//         </Table.Column>
//       )}
//       <Aria.Collection items={columns}>{children}</Aria.Collection>
//     </Table.Header>
//   );
// };

// type DatatableRowProps<TData extends object> = TableRowProps<TData>;

// const Row = <TData extends object>({
//   children,
//   columns,
//   ...props
// }: DatatableRowProps<TData>) => {
//   const { selection } = useDatatableContext();

//   return (
//     <Table.Row {...props}>
//       {selection?.behaviour === "toggle" && (
//         <Table.Cell>
//           <Checkbox slot="selection" />
//         </Table.Cell>
//       )}
//       <Aria.Collection items={columns}>{children}</Aria.Collection>
//     </Table.Row>
//   );
// };

// type DatatablePaginationProps = ComponentPropsWithRef<"div">;

// const Footer = ({ ...props }: DatatablePaginationProps) => {
//   const { pagination, setQuery } = useDatatableContext();
//   return (
//     <div {...props}>
//       <Pagination
//         currentPage={pagination?.page || 1}
//         totalPages={Math.ceil(
//           pagination?.total || 0 / (pagination?.size || 10),
//         )}
//         onPageChange={(page) => {
//           setQuery((draft) => {
//             draft.pagination = { ...draft.pagination, page };
//           });
//         }}
//         href={undefined}
//       />
//     </div>
//   );
// };

// // export const Datatable = Object.assign(Root, {
// //   Table: Table,
// //   Column,
// //   Header,
// //   Row,
// //   Body: Table.Body,
// //   Cell: Table.Cell,
// // });

// export type {
//   DatatableProps,
//   DatatableColumnProps,
//   DatatableHeaderProps,
//   DatatableRowProps,
//   DatatablePaginationProps,
// };

export const Datatable = Object.assign(Root, {
  Cell: Table.Cell,
});
export type { DatatableProps };
