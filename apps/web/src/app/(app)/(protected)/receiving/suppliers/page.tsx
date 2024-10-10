"use client";

import { api } from "@/utils/trpc/react";

import { RouterOutputs } from "@repo/api";
import { Datatable, Table } from "@repo/ui/components/display";
import { Button } from "@repo/ui/components/element";

export default function OrdersPage() {
  return (
    <div>
      {/* <Datatable<RouterOutputs["receiving"]["supplier"]["list"]["rows"][number]>
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
      /> */}
    </div>
  );
}
