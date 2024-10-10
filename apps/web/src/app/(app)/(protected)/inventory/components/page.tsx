"use client";

import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Link } from "@repo/ui/components/navigation";

export default function InventoryOverview() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-muted-foreground text-2xl font-bold">Components</h1>

      <Datatable
        idKey="id"
        data={({ ...query }) => {
          const { isLoading, data } = api.component.list.useQuery({
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
            isRowHeader: true,
            sortKey: "id",
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
            sortKey: "description",
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
            sortKey: "departmentName",
            label: "Department",
            cell: (component) => (
              <Datatable.Cell>
                <Badge>{component.departmentName}</Badge>
              </Datatable.Cell>
            ),
          },
          {
            id: "category",
            sortKey: "categoryName",
            label: "Category",
            cell: (component) => (
              <Datatable.Cell>
                <Badge>{component.categoryName}</Badge>
              </Datatable.Cell>
            ),
          },
          {
            id: "totalQuantity",
            sortKey: "totalQuantity",
            label: "Quantity",
            cell: (component) => (
              <Datatable.Cell>{component.totalQuantity}</Datatable.Cell>
            ),
          },
          {
            id: "sageQuantity",
            sortKey: "sageQuantity",
            label: "Sage Quantity",
            cell: (component) => (
              <Datatable.Cell>{component.sageQuantity}</Datatable.Cell>
            ),
          },
          {
            id: "unit",
            sortKey: "unit",
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
