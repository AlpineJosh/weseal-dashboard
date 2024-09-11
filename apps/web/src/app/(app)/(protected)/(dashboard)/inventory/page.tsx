"use client";

import { api } from "@/utils/trpc/react";

import { Table } from "@repo/ui/components/display";
import { Card } from "@repo/ui/components/layout";

export default function InventoryPage() {
  const { data } = api.component.list.useQuery({
    pagination: {
      page: 1,
      size: 20,
    },
  });

  return (
    <Card>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Stock Code</Table.Head>
            <Table.Head>Description</Table.Head>
            <Table.Head>Quantity</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data?.map((component) => (
            <Table.Row key={component.id}>
              <Table.Cell>{component.id}</Table.Cell>
              <Table.Cell>{component.description}</Table.Cell>
              <Table.Cell>{component.totalQuantity}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
}
