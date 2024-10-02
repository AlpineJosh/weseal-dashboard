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

      <Datatable<
        RouterOutputs["inventory"]["movements"]["list"]["rows"][number]
      >
        data={api.inventory.movements.list.useQuery}
        columns={[
          {
            accessor: "id",
            label: "ID",
          },
          {
            accessor: "type",
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
            accessor: "componentId",
            label: "Stock Code",
          },
          {
            accessor: "batchReference",
            label: "Batch Reference",
          },
          {
            accessor: "locationName",
            label: "Location",
          },
          {
            accessor: "quantity",
            label: "Quantity",
          },
          {
            accessor: "date",
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
