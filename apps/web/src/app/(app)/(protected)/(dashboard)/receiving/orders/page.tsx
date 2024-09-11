"use client";

import { api } from "@/utils/trpc/react";

import { Table } from "@repo/ui/components/display";
import { Badge, Button } from "@repo/ui/components/element";
import { Card } from "@repo/ui/components/layout";
import { Link } from "@repo/ui/components/navigation";
import { Modal } from "@repo/ui/components/overlay";

export default function ReceivingPage() {
  const { data } = api.receiving.order.list.useQuery();
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-2xl font-semibold">Purchase Orders</h1>
      <Card>
        <Table className="border-b">
          <Table.Header>
            <Table.Row>
              <Table.Head>Purchase Order</Table.Head>
              <Table.Head>Account</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Order Date</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data?.map((order) => (
              <Table.Row key={order.id}>
                <Table.Cell>{order.id}</Table.Cell>
                <Table.Cell>{order.supplier.name}</Table.Cell>
                <Table.Cell>
                  <Badge>{order.isComplete ? "Received" : "Pending"}</Badge>
                </Table.Cell>
                <Table.Cell>{order.orderDate?.toLocaleDateString()}</Table.Cell>
                <Table.Cell className="flex gap-2 p-0">
                  <Modal.Trigger>
                    <Link>Receive</Link>
                    <Modal.Content>
                      <p>Hello</p>
                    </Modal.Content>
                  </Modal.Trigger>
                  <Button variant="ghost">View Details</Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <div className="flex w-full flex-row justify-end p-2">
          <Button>Next</Button>
        </div>
      </Card>
    </div>
  );
}
