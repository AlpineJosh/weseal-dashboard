"use client";

import { api } from "@/utils/trpc/react";

import { Table } from "@repo/ui/components/display";
import { Badge, Button } from "@repo/ui/components/element";
import { Link } from "@repo/ui/components/navigation";

export default function ReceivingPage() {
  const { data } = api.despatching.order.list.useQuery({ filter: {} });
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-2xl font-semibold">Sales Orders</h1>
      {/* <Card>
        <Table className="border-b">
          <Table.Header>
            <Table.Row>
              <Table.Head className="whitespace-nowrap">Sales Order</Table.Head>
              <Table.Head>Account</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Order Date</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data?.rows.map((order) => (
              <Table.Row key={order.id}>
                <Table.Cell>{order.id}</Table.Cell>
                <Table.Cell className="truncate">
                  {order.customer.name}
                </Table.Cell>
                <Table.Cell>
                  <Badge>{order.isComplete ? "Despatched" : "Pending"}</Badge>
                </Table.Cell>
                <Table.Cell>{order.orderDate?.toLocaleDateString()}</Table.Cell>
                <Table.Cell className="flex flex-row items-center space-x-2">
                  <Link
                    className="whitespace-nowrap"
                    href="/inventory/tasks/create/despatching"
                  >
                    Despatch
                  </Link>
                  <Link
                    className="whitespace-nowrap"
                    href={`/receiving/orders/${order.id}`}
                  >
                    View Details
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <div className="flex w-full flex-row justify-end p-2">
          <Button>Next</Button>
        </div>
      </Card> */}
    </div>
  );
}
