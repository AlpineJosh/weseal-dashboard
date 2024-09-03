"use client";

import Link from "next/link";

import { Table } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Card } from "@repo/ui/components/layout";

import { api } from "~/trpc/react";

export default function ComponentPage({
  params,
}: {
  params: { componentId: string };
}) {
  const { data } = api.component.get.useQuery({
    id: params.componentId,
  });

  return (
    <div className="w-full max-w-screen-xl">
      {data && (
        <>
          <h1 className="text-2xl font-bold">{data.id}</h1>
          <span className="text-muted-foreground">{data.description}</span>
          <div className="mt-1 flex flex-row space-x-2">
            <Badge variant="primary">Department: {data.department?.name}</Badge>
            <Badge variant="primary">Category: {data.category?.name}</Badge>
          </div>
          <div className="my-4 h-px w-full bg-border" />
          <div>
            {data.subcomponents.map((subcomponent) => (
              <div key={subcomponent.id}>{subcomponent.id}</div>
            ))}
          </div>
          <div className="flex w-full flex-row justify-stretch space-x-4">
            <Card className="flex flex-1 flex-col space-y-2 p-2">
              <h3 className="text-muted-foreground">Quantity In Stock</h3>
              <span className="flex flex-row items-baseline space-x-1">
                <span className="text-2xl font-semibold">
                  {data.totalQuantity}
                </span>
                <span className="text-muted-foreground">{data.unit}</span>
              </span>
            </Card>
            <Card className="flex flex-1 flex-col space-y-2 p-2">
              <h3 className="text-muted-foreground">Allocated</h3>
              <span className="flex flex-row items-baseline justify-end space-x-1">
                <span className="text-2xl font-semibold">
                  {data.allocatedQuantity}
                </span>
                <span className="text-muted-foreground">{data.unit}</span>
              </span>
            </Card>
            <Card className="flex flex-1 flex-col space-y-2 p-2">
              <h3 className="text-muted-foreground">Free</h3>
              <span className="flex flex-row items-baseline justify-end space-x-1">
                <span className="text-2xl font-semibold">
                  {data.freeQuantity}
                </span>
                <span className="text-muted-foreground">{data.unit}</span>
              </span>
            </Card>
            <Card className="flex flex-1 flex-col space-y-2 p-2">
              <h3 className="text-muted-foreground">Quantity In Sage</h3>
              <span className="flex flex-row items-baseline justify-end space-x-1">
                <span className="text-2xl font-semibold">
                  {data.sageQuantity}
                </span>
                <span className="text-muted-foreground">{data.unit}</span>
              </span>
            </Card>
          </div>
          <Card className="mt-4">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Subcomponent</Table.Head>
                  <Table.Head>Quantity</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.subcomponents.map((subcomponent) => (
                  <Table.Row key={subcomponent.id}>
                    <Table.Cell>
                      <Link href={`/inventory/components/${subcomponent.id}`}>
                        {subcomponent.id}
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
