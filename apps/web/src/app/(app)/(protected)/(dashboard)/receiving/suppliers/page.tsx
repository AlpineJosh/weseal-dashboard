"use client";

import { api } from "@/utils/trpc/react";

import { RouterOutputs } from "@repo/api";
import { Datatable, Table } from "@repo/ui/components/display";
import { Button } from "@repo/ui/components/element";
import { Card } from "@repo/ui/components/layout";
import { Modal } from "@repo/ui/components/overlay";

export default function OrdersPage() {
  return (
    <Card>
      <Datatable<RouterOutputs["receiving"]["supplier"]["list"]["rows"][number]>
        columns={[
          {
            label: "Reference",
            accessor: "id",
          },
          {
            label: "Name",
            accessor: "name",
          },
        ]}
        data={api.receiving.supplier.list.useQuery}
      />
    </Card>
  );
}
