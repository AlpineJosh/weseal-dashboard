"use client";

import { api } from "@/utils/trpc/react";

import { RouterOutputs } from "@repo/api";
import { Datatable, Table } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Link } from "@repo/ui/components/navigation";

const types: Record<
  | "production"
  | "despatch"
  | "receipt"
  | "transfer"
  | "correction"
  | "wastage"
  | "lost"
  | "found",
  { title: string; color: any }
> = {
  production: { title: "Production", color: "green" },
  despatch: { title: "Despatch", color: "purple" },
  receipt: { title: "Receipt", color: "green" },
  transfer: { title: "Transfer", color: "blue" },
  correction: { title: "Correction", color: "orange" },
  wastage: { title: "Wastage", color: "red" },
  lost: { title: "Lost", color: "rose" },
  found: { title: "Found", color: "teal" },
};

export default function InventoryOverview() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-muted-foreground text-2xl font-bold">
        Transaction Log
      </h1>

      <Datatable
        idKey="id"
        data={({ ...query }) => {
          const { isLoading, data } = api.inventory.movements.list.useQuery({
            ...query,
          });
          return {
            data,
            isLoading,
          };
        }}
        columns={[
          {
            id: "id",
            sortKey: "id",
            isRowHeader: true,
            label: "ID",
            cell: (row) => {
              return (
                <Datatable.Cell>
                  <Link href={`/inventory/movements/${row.id}`}>{row.id}</Link>
                </Datatable.Cell>
              );
            },
          },
          {
            id: "type",
            sortKey: "type",
            label: "Type",
            cell: ({ type }) => {
              return (
                <Table.Cell>
                  {type && (
                    <Badge color={types[type].color}>{types[type].title}</Badge>
                  )}
                </Table.Cell>
              );
            },
          },
          {
            id: "componentId",
            sortKey: "componentId",
            label: "Stock Code",
            cell: ({ componentId }) => {
              return (
                <Table.Cell>
                  <Link href={`/inventory/components/${componentId}`}>
                    {componentId}
                  </Link>
                </Table.Cell>
              );
            },
          },
          {
            id: "batchReference",
            sortKey: "batchReference",
            label: "Batch Reference",
            cell: ({ batchReference }) => {
              return <Table.Cell>{batchReference}</Table.Cell>;
            },
          },
          {
            id: "locationName",
            sortKey: "locationName",
            label: "Location",
            cell: ({ locationName }) => {
              return <Table.Cell>{locationName}</Table.Cell>;
            },
          },
          {
            id: "quantity",
            sortKey: "quantity",
            label: "Quantity",
            cell: ({ quantity }) => {
              return <Table.Cell>{quantity}</Table.Cell>;
            },
          },
          {
            id: "date",
            sortKey: "date",
            label: "Date",
            cell: ({ date }) => {
              return (
                <Table.Cell>
                  {date?.toLocaleDateString()} {date?.toLocaleTimeString()}
                </Table.Cell>
              );
            },
          },
        ]}
      />
    </div>
  );
}
