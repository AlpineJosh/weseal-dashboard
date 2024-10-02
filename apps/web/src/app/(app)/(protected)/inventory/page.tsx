"use client";

import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";

export default function InventoryPage() {
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-2xl font-semibold">Sage Discrepancies</h1>

      <Datatable
        columns={[
          {
            id: "id",
            isRowHeader: true,
            key: "id",
            label: "ID",
            cell: (row) => <Datatable.Cell>{row.id}</Datatable.Cell>,
          },
          {
            id: "description",
            key: "description",
            label: "Description",
            cell: (row) => <Datatable.Cell>{row.description}</Datatable.Cell>,
          },
          {
            id: "category",
            key: "category",
            label: "Category",
            cell: (row) => (
              <Datatable.Cell>{row.category?.name}</Datatable.Cell>
            ),
          },
          {
            id: "totalQuantity",
            key: "totalQuantity",
            label: "Quantity",
            cell: (row) => <Datatable.Cell>{row.totalQuantity}</Datatable.Cell>,
          },
          {
            id: "sageQuantity",
            key: "sageQuantity",
            label: "Quantity In Sage",
            cell: (row) => <Datatable.Cell>{row.sageQuantity}</Datatable.Cell>,
          },
          {
            id: "sageDiscrepancy",
            key: "sageDiscrepancy",
            label: "Discrepancy",
            cell: (row) => (
              <Datatable.Cell>{row.sageDiscrepancy.toFixed(2)}</Datatable.Cell>
            ),
          },
        ]}
        data={(query) => api.component.list.useQuery(query)}
      />
    </div>
  );
}
