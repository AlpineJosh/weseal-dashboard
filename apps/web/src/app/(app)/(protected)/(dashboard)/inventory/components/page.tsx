"use client";

import { api } from "@/utils/trpc/react";
import { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { useImmer } from "use-immer";

import { Table } from "@repo/ui/components/display";
import { Card } from "@repo/ui/components/layout";

export default function ComponentsPage() {
  const { data } = api.component.list.useQuery({
    pagination: {
      page: 1,
      size: 20,
    },
  });

  return (
    <Card>
      <DataTable
        useQuery={(params) =>
          api.component.list.useQuery({
            pagination: {
              page: 1,
              size: 20,
            },
          })
        }
        columns={[
          {
            key: "id",
            title: "Stock Code",
            render: (data) => data.id,
          },
          {
            key: "description",
            title: "Description",
            render: (data) => data.description,
          },
          {
            key: "department",
            title: "Department",
            render: (data) => data.department?.name,
          },
          {
            key: "category",
            title: "Category",
            render: (data) => data.category?.name,
          },
          {
            key: "totalQuantity",
            title: "Quantity",
            render: (data) => data.totalQuantity,
          },
          {
            key: "sageQuantity",
            title: "Sage Quantity",
            render: (data) => data.sageQuantity,
          },
          {
            key: "unit",
            title: "Unit",
            render: (data) => data.unit,
          },
        ]}
      />
    </Card>
  );
}

type QueryParams = {
  pagination: {
    page: number;
    size: number;
  };
  search?: string;
};

type Column<TData> = {
  key: string;
  title: string;
  render: (data: TData) => React.ReactNode;
};

type DataTableProps<TQueryParams, TData, TError> = {
  useQuery: (params: TQueryParams) => UseTRPCQueryResult<TData[], TError>;
  columns: Column<TData>[];
};

export function DataTable<TQueryParams, TData, TError>({
  useQuery,
  columns,
}: DataTableProps<TQueryParams, TData, TError>) {
  const [params, setParams] = useImmer<TQueryParams>({});
  const { data } = useQuery(params);

  // const { data} = api.component.list.useQuery({
  //   pagination: {
  //     page: 1,
  //     size: 20,
  //   },
  // });
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          {columns.map((column) => (
            <Table.Head key={column.key}>{column.title}</Table.Head>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data?.map((row, index) => (
          <Table.Row key={index}>
            {columns.map((column) => (
              <Table.Cell key={column.key}>{column.render(row)}</Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
