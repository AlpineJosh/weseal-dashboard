"use client";

import { api } from "@/utils/trpc/react";

import { faPlus } from "@repo/pro-solid-svg-icons";
import { Table } from "@repo/ui/components/display";
import { Badge, Button, Icon } from "@repo/ui/components/element";

export default function ReceivingPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { data } = api.receiving.orders.get.useQuery({ id: +params.orderId });

  const { data: items } = api.receiving.orders.items.list.useQuery({
    filter: {
      orderId: {
        eq: +params.orderId,
      },
    },
  });

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex w-full flex-row items-center">
          <div className="grow">
            <span className="flex flex-row items-baseline space-x-2">
              <span className="text-muted-foreground text-sm font-medium">
                Purchase Order
              </span>
              <Badge>{data?.isCancelled ? "Cancelled" : "Pending"}</Badge>
            </span>
            <h1 className="text-2xl font-semibold"># {params.orderId}</h1>
            <h3 className="font-medium">{data?.supplierName}</h3>
          </div>
          <div>
            <Button variant="solid">Receive Goods</Button>
          </div>
        </div>
        <div className="w-full border-b" />
        <h3 className="text-muted-foreground font-semibold">
          Purchase Order Components
        </h3>
        <Table className="border-b">
          <Table.Head>
            <Table.Column id="componentId">Component</Table.Column>
            <Table.Column id="quantityOrdered">Ordered</Table.Column>
            <Table.Column id="sageQuantityReceived">Received</Table.Column>
          </Table.Head>
          <Table.Body items={items?.rows ?? []}>
            {({ data: item }) => (
              <Table.Row key={item.id}>
                <Table.Cell id="componentId">{item.componentId}</Table.Cell>
                <Table.Cell id="quantityOrdered">{item.quantityOrdered}</Table.Cell>
                <Table.Cell id="sageQuantityReceived">{item.sageQuantityReceived}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <div className="w-full border-b" />
        <div className="flex flex-row items-center justify-between">
          <h3 className="text-muted-foreground font-semibold">Deliveries</h3>
          <Button variant="solid">
            <Icon icon={faPlus} />
            Add Delivery
          </Button>
        </div>
        <Table className="border-b">
          <Table.Head>
            <Table.Column id="dueDate">Due Date</Table.Column>
            <Table.Column id="receiptDate">Receipt Date</Table.Column>
            <Table.Column id="status">Status</Table.Column>
          </Table.Head>
          <Table.Body>
            {() => (
              <Table.Row id="noDeliveriesPlanned">
                <Table.Cell id="dueDate">No deliveries planned</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </>
  );
}
