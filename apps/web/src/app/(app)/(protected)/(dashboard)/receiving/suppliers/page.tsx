"use client";

import { api } from "@/utils/trpc/react";

import { Table } from "@repo/ui/components/display";
import { Button } from "@repo/ui/components/element";
import { Card } from "@repo/ui/components/layout";
import { Modal } from "@repo/ui/components/overlay";

export default function OrdersPage() {
  const { data } = api.purchaseAccount.all.useQuery();

  return (
    <Card>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Account Id</Table.Head>
            <Table.Head>Account Name</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data?.data.map((purchaseOrder) => (
            <Table.Row key={purchaseOrder.id}>
              <Table.Cell>{purchaseOrder.id}</Table.Cell>
              <Table.Cell>{purchaseOrder.name}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
}
