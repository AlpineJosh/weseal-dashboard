"use client";

import { api } from "@/utils/trpc/react";
import { faPlus } from "@fortawesome/pro-solid-svg-icons";

import { Icon, Table } from "@repo/ui/components/display";
import { Badge, Button } from "@repo/ui/components/element";
import { Card } from "@repo/ui/components/layout";

export default function ReceivingPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { data } = api.despatching.order.get.useQuery({ id: +params.orderId });
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex w-full flex-row items-center">
        <div className="grow">
          <span className="flex flex-row items-baseline space-x-2">
            <span className="text-sm font-medium text-muted-foreground">
              Sales Order
            </span>
            <Badge variant="primary">
              {data?.isComplete ? "Complete" : "Pending"}
            </Badge>
          </span>
          <h1 className="text-2xl font-semibold"># {params.orderId}</h1>
          <h3 className="font-medium">{data?.customer.name}</h3>
        </div>
        <div>
          <Button variant="primary">Despatch Goods</Button>
        </div>
      </div>
      <div className="w-full border-b" />
      <h3 className="font-semibold text-muted-foreground">
        Purchase Order Components
      </h3>
      <Card>
        <Table className="border-b">
          <Table.Header>
            <Table.Row>
              <Table.Head>Component</Table.Head>
              <Table.Head>Ordered</Table.Head>
              <Table.Head>Received</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data?.items.map((item, index) => (
              <Table.Row key={index}>
                <Table.Cell>{item.component.id}</Table.Cell>
                <Table.Cell>{item.quantityOrdered}</Table.Cell>
                <Table.Cell>{item.sageQuantityReceived}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
      <div className="w-full border-b" />
      <div className="flex flex-row items-center justify-between">
        <h3 className="font-semibold text-muted-foreground">Despatches</h3>
        <Button variant="primary">
          <Icon icon={faPlus} />
          Add Despatch
        </Button>
      </div>
      <Card>
        <Table className="border-b">
          <Table.Header>
            <Table.Row>
              <Table.Head>Due Date</Table.Head>
              <Table.Head>Receipt Date</Table.Head>
              <Table.Head>Status</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell className="col-span-3">
                No despatches planned
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
}
