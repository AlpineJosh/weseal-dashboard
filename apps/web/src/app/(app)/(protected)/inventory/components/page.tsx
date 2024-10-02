"use client";

import { api } from "@/utils/trpc/react";
import { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { useImmer } from "use-immer";

import { RouterOutputs } from "@repo/api";
import { Datatable, Table } from "@repo/ui/components/display";
import { Link } from "@repo/ui/components/navigation";

export default function InventoryOverview() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-muted-foreground text-2xl font-bold">Components</h1>

      <Datatable<RouterOutputs["component"]["list"]["rows"][number]>
        data={api.component.list.useQuery}
        columns={[
          {
            accessor: "id",
            label: "Stock Code",
            cell: (component) => (
              <Table.Cell>
                <Link href={`/inventory/components/${component.id}`}>
                  {component.description}
                </Link>
              </Table.Cell>
            ),
          },
          {
            accessor: "description",
            label: "Description",
          },
          {
            accessor: (component) => component.department?.name,
            label: "Department",
          },
          {
            accessor: (component) => component.category?.name,
            label: "Category",
          },
          {
            accessor: "totalQuantity",
            label: "Quantity",
          },
          {
            accessor: "sageQuantity",
            label: "Sage Quantity",
          },
          {
            accessor: "unit",
            label: "Unit",
          },
        ]}
      />
    </div>
  );
}
