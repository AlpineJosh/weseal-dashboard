"use client";

import { Datatable } from "@repo/ui/components/display";
import { Badge, Divider } from "@repo/ui/components/element";
import { TabBar } from "@repo/ui/components/navigation";
import { Heading, Subheading, Text } from "@repo/ui/components/typography";

import StatBlock from "@/components/StatBlock";
import { component } from "@/models/component";
import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

export default function ComponentPage({
  params,
}: {
  params: { componentId: string };
}) {
  const id = component.decodeURLId(params.componentId);

  const { data } = api.component.get.useQuery({
    id,
  });

  return (
    <>
      {data && (
        <div className="-mb-px grid grid-cols-1 gap-px bg-content/10 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock
            className="bg-background"
            label="Quantity In Stock"
            value={data.totalQuantity.toNumber()}
            unit={data.unit}
          />
          <StatBlock
            className="bg-background"
            label="Allocated"
            value={data.allocatedQuantity.toNumber()}
            unit={data.unit}
          />
          <StatBlock
            className="bg-background"
            label="Free"
            value={data.freeQuantity.toNumber()}
            unit={data.unit}
          />
          <StatBlock
            className="bg-background"
            label="Quantity In Sage"
            value={data.sageQuantity.toNumber()}
            unit={data.unit}
          />
        </div>
      )}
    </>
  );
}
