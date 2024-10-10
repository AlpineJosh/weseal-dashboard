"use client";

import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Link } from "@repo/ui/components/navigation";

export default function ReceivingPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-muted-foreground text-2xl font-bold">Sales Orders</h1>

      <Datatable
        idKey="id"
        data={({ ...query }) => {
          const { isLoading, data } = api.despatching.order.list.useQuery({
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
            id: "customer",
            sortKey: "customerName",
            label: "Customer",
            cell: (row) => <Datatable.Cell>{row.customerName}</Datatable.Cell>,
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
            id: "nextExpectedDespatch",
            sortKey: "nextExpectedDespatch",
            label: "Due Date",
            cell: (row) => (
              <Datatable.Cell>
                {row.nextExpectedDespatch?.toLocaleDateString()}
              </Datatable.Cell>
            ),
          },
          {
            id: "despatchCount",
            sortKey: "despatchCount",
            label: "Deliveries Sent",
            cell: (row) => <Datatable.Cell>{row.despatchCount}</Datatable.Cell>,
          },
        ]}
      />
    </div>
  );
}
