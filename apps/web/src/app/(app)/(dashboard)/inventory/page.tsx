"use client";

import { Table } from "@repo/ui/components/display";
import { Card } from "@repo/ui/components/layout";

import { api } from "~/trpc/react";

export default function InventoryPage() {
  const { data } = api.component.all.useQuery({
    filter: {},
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
          {data?.data.map((component) => (
            <Table.Row key={component.id}>
              <Table.Cell>{component.id}</Table.Cell>
              <Table.Cell>{component.description}</Table.Cell>
              <Table.Cell>{component.quantity as number}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
}
