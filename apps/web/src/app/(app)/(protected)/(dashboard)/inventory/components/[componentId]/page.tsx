"use client";

import Link from "next/link";
import { api } from "@/utils/trpc/react";

import { Table } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Card } from "@repo/ui/components/layout";

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
          <div className="my-4 flex flex-col space-y-4">
            {data.subcomponents.length > 0 && (
              <>
                <h3 className="text-muted-foreground">Subcomponents</h3>
                <Card>
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>Subcomponent</Table.Head>
                        <Table.Head>Description</Table.Head>
                        <Table.Head>Quantity Required</Table.Head>
                        <Table.Head>Quantity Available</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {data.subcomponents.map((subcomponent) => (
                        <Table.Row key={subcomponent.id}>
                          <Table.Cell>
                            <Link
                              href={`/inventory/components/${subcomponent.subcomponentId}`}
                            >
                              {subcomponent.subcomponentId}
                            </Link>
                          </Table.Cell>
                          <Table.Cell>
                            {subcomponent.subcomponentOverview.description}
                          </Table.Cell>
                          <Table.Cell>{subcomponent.quantity}</Table.Cell>
                          <Table.Cell>
                            {subcomponent.subcomponentOverview.totalQuantity}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </Card>
              </>
            )}
            {data.locations.length > 0 && (
              <>
                <h3 className="text-muted-foreground">Locations</h3>
                <Card>
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>Location</Table.Head>
                        <Table.Head>Batch</Table.Head>
                        <Table.Head>Total</Table.Head>
                        <Table.Head>Allocated</Table.Head>
                        <Table.Head>Free</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {data.locations.map((location, index) => (
                        <Table.Row key={index}>
                          <Table.Cell>
                            <Link
                              className="hover:underline"
                              href={`/inventory/locations/${location.locationId}`}
                            >
                              {location.location?.name}
                            </Link>
                          </Table.Cell>
                          <Table.Cell>
                            {location.batch?.batchReference}
                          </Table.Cell>
                          <Table.Cell>{location.total}</Table.Cell>
                          <Table.Cell>{location.allocated}</Table.Cell>
                          <Table.Cell>{location.free}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </Card>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
