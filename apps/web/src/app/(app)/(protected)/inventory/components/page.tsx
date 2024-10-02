"use client";

import { api } from "@/utils/trpc/react";
import { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { useImmer } from "use-immer";

import { RouterOutputs } from "@repo/api";
import { Datatable, Table } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Link } from "@repo/ui/components/navigation";

export default function InventoryOverview() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-muted-foreground text-2xl font-bold">Components</h1>

      <Datatable
        data={api.component.list.useQuery}
        columns={[
          {
            id: "id",
            isRowHeader: true,
            key: "id",
            label: "Stock Code",
            cell: (component) => (
              <Datatable.Cell>
                <Link href={`/inventory/components/${component.id}`}>
                  {component.id}
                </Link>
              </Datatable.Cell>
            ),
          },
          {
            id: "description",
            key: "description",
            label: "Description",
            cell: (component) => (
              <Datatable.Cell>
                <Link href={`/inventory/components/${component.id}`}>
                  {component.description}
                </Link>
              </Datatable.Cell>
            ),
          },
          {
            id: "department",
            key: "department",
            label: "Department",
            cell: (component) => (
              <Datatable.Cell>
                <Badge>{component.department?.name}</Badge>
              </Datatable.Cell>
            ),
          },
          {
            id: "category",
            key: "category",
            label: "Category",
            cell: (component) => (
              <Datatable.Cell>
                <Badge>{component.category?.name}</Badge>
              </Datatable.Cell>
            ),
          },
          {
            id: "totalQuantity",
            key: "totalQuantity",
            label: "Quantity",
            cell: (component) => (
              <Datatable.Cell>{component.totalQuantity}</Datatable.Cell>
            ),
          },
          {
            id: "sageQuantity",
            key: "sageQuantity",
            label: "Sage Quantity",
            cell: (component) => (
              <Datatable.Cell>{component.sageQuantity}</Datatable.Cell>
            ),
          },
          {
            id: "unit",
            key: "unit",
            label: "Unit",
            cell: (component) => (
              <Datatable.Cell>{component.unit}</Datatable.Cell>
            ),
          },
        ]}
      />
    </div>
  );
}
