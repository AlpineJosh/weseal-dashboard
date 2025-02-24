"use client";

import { component } from "@/models/component";
import { api } from "@/utils/trpc/react";

import { Badge } from "@repo/ui/components/element";
import { TabBar } from "@repo/ui/components/navigation";
import { Heading, Text } from "@repo/ui/components/typography";

interface ComponentLayoutProps {
  children: React.ReactNode;
  params: { componentId: string };
}

export default function ComponentLayout({
  children,
  params,
}: ComponentLayoutProps) {
  const id = component.decodeURLId(params.componentId);

  const { data } = api.component.get.useQuery({
    id,
  });

  return (
    <div className="flex max-w-screen-xl grow flex-col space-y-4">
      {data && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Heading level={1}>{data.id}</Heading>
            <Text className="text-content-muted">{data.description}</Text>
            <div className="flex flex-col items-start space-y-2">
              <Badge color="primary">Department: {data.departmentName}</Badge>
              <Badge color="secondary">Category: {data.categoryName}</Badge>
            </div>
          </div>
        </div>
      )}
      <TabBar>
        <TabBar.Tab href={`/components/${component.encodeURLId(id)}`}>
          Overview
        </TabBar.Tab>
        <TabBar.Tab href={`/components/${component.encodeURLId(id)}/stock`}>
          Stock
        </TabBar.Tab>
        {data?.isBatchTracked && (
          <TabBar.Tab href={`/components/${component.encodeURLId(id)}/batches`}>
            Batches
          </TabBar.Tab>
        )}
        <TabBar.Tab
          href={`/components/${component.encodeURLId(id)}/subcomponents`}
        >
          Subcomponents
        </TabBar.Tab>
        {/* <TabBar.Tab href={`/components/${component.encodeURLId(id)}/history`}>
          History
        </TabBar.Tab> */}
      </TabBar>
      <div>{children}</div>
    </div>
  );
}
