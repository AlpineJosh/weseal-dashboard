"use client";

import { api } from "@/utils/trpc/react";

import { RouterOutputs } from "@repo/api";
import { Datatable, Table } from "@repo/ui/components/display";

export default function InventoryPage() {
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-2xl font-semibold">Sage Discrepancies</h1>

      <Datatable<RouterOutputs["component"]["list"]["rows"][number]>
        columns={[
          {
            accessor: "id",
            label: "ID",
          },
          {
            accessor: "description",
            label: "Description",
          },
          {
            accessor: (row) => row.category?.name,
            label: "Category",
          },
          {
            accessor: "totalQuantity",
            label: "Quantity",
          },
          {
            accessor: "sageQuantity",
            label: "Quantity In Sage",
          },
          {
            accessor: "sageDiscrepancy",
            label: "Discrepancy",
          },
        ]}
        data={api.component.list.useQuery}
        filter={{ sageDiscrepancy: { neq: 0 } }}
      />
    </div>
  );
}
