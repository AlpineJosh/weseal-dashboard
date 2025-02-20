"use client";

import { api } from "@/utils/trpc/react";

import { Badge } from "@repo/ui/components/element";
import { TabBar } from "@repo/ui/components/navigation";
import { Heading, Text } from "@repo/ui/components/typography";

interface ComponentLayoutProps {
  children: React.ReactNode;
  params: { orderId: string };
}

export default function ComponentLayout({
  children,
  params,
}: ComponentLayoutProps) {
  const id = +params.orderId;

  const { data } = api.despatching.order.get.useQuery({
    id,
  });

  return (
    <div className="flex max-w-screen-xl grow flex-col space-y-4">
      {data && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Heading level={1}>#{data.id}</Heading>
            <Text className="text-content-muted">{data.customerName}</Text>
            <div className="flex flex-col items-start space-y-2">
              <Badge>{data.isCancelled ? "Cancelled" : "Pending"}</Badge>
            </div>
          </div>
        </div>
      )}
      <TabBar>
        <TabBar.Tab href={`/despatching/orders/${id}`}>Overview</TabBar.Tab>
        <TabBar.Tab href={`/despatching/orders/${id}/despatches`}>
          Despatches
        </TabBar.Tab>
      </TabBar>
      <div>{children}</div>
    </div>
  );
}
