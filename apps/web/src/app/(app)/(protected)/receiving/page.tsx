"use client";

import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Link } from "@repo/ui/components/navigation";

export default function ReceivingPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-muted-foreground text-2xl font-bold">
        Purchase Orders
      </h1>

      <Datatable
        idKey="id"
        data={({ ...query }) => {
          const { isLoading, data } = api.receiving.orders.list.useQuery({
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
            label: "Order Number",
            cell: (row) => (
              <Datatable.Cell>
                <Link href={`/receiving/${row.id}`}>{row.id}</Link>
              </Datatable.Cell>
            ),
          },
          {
            id: "supplier",
            sortKey: "supplierName",
            label: "Supplier",
            cell: (row) => <Datatable.Cell>{row.supplierName}</Datatable.Cell>,
          },
          {
            id: "status",
            label: "Status",
            cell: (row) => (
              <Datatable.Cell>
                <Badge>
                  {row.isComplete
                    ? "Completed"
                    : row.isCancelled
                      ? "Cancelled"
                      : "Pending"}
                </Badge>
              </Datatable.Cell>
            ),
          },
          {
            id: "nextExpectedReceipt",
            sortKey: "nextExpectedReceipt",
            label: "Due Date",
            cell: (row) => (
              <Datatable.Cell>
                {row.nextExpectedReceipt?.toLocaleDateString()}
              </Datatable.Cell>
            ),
          },
          {
            id: "receiptCount",
            sortKey: "receiptCount",
            label: "Deliveries Received",
            cell: (row) => <Datatable.Cell>{row.receiptCount}</Datatable.Cell>,
          },
        ]}
      />
    </div>
  );
}
