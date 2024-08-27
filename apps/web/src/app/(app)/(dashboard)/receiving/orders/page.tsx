"use client";

import { Table } from "@repo/ui/components/display";
import { Button } from "@repo/ui/components/element";
import { Card } from "@repo/ui/components/layout";
import { Modal } from "@repo/ui/components/overlay";

import { api } from "~/trpc/react";

export default function OrdersPage() {
  const { data } = api.purchaseOrder.all.useQuery();

  return (
    <Card>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Purchase Order</Table.Head>
            <Table.Head>Account</Table.Head>
            <Table.Head>Due Date</Table.Head>
            <Table.Head>Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data?.data.map((purchaseOrder) => (
            <Table.Row key={purchaseOrder.id}>
              <Table.Cell>{purchaseOrder.id}</Table.Cell>
              <Table.Cell>{purchaseOrder.accountId}</Table.Cell>
              <Table.Cell>
                {purchaseOrder.deliveryDate?.toLocaleDateString()}
              </Table.Cell>
              <Table.Cell className="flex gap-2 p-0">
                <Modal.Trigger>
                  <Button variant="ghost">Receive</Button>
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
    </Card>
  );
}
