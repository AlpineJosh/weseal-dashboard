"use client";

import { api } from "@/utils/trpc/react";

import { Table } from "@repo/ui/components/display";
import { Badge, Button } from "@repo/ui/components/element";
import { Heading, Subheading } from "@repo/ui/components/typography";

export default function TaskPage({ params }: { params: { taskId: string } }) {
  const utils = api.useUtils();
  const { data: task } = api.task.get.useQuery({ id: Number(params.taskId) });
  const { mutate: completeItem } = api.task.completeItem.useMutation({
    onSuccess: () => {
      utils.task.get.invalidate({ id: Number(params.taskId) });
    },
  });

  return (
    <div>
      <Heading level={1}>Task #{task?.id}</Heading>
      <Subheading level={2}>Items</Subheading>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Column isRowHeader>Stock Code</Table.Column>
            <Table.Column>Quantity</Table.Column>
            <Table.Column>Batch</Table.Column>
            <Table.Column>From Location</Table.Column>
            <Table.Column>To Location</Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column>Actions</Table.Column>
          </Table.Row>
        </Table.Header>
        <Table.Body items={task?.items}>
          {(item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.batch.component.id}</Table.Cell>
              <Table.Cell>{item.quantity}</Table.Cell>
              <Table.Cell>{item.batch.batchReference}</Table.Cell>
              <Table.Cell>{item.pickLocation?.name}</Table.Cell>
              <Table.Cell>{item.putLocation?.name}</Table.Cell>
              <Table.Cell>
                <Badge color={item.isComplete ? "green" : "red"}>
                  {item.isComplete ? "Complete" : "Incomplete"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                {!item.isComplete && (
                  <Button
                    variant="plain"
                    color="primary"
                    onPress={() => completeItem({ id: item.id })}
                  >
                    Mark Complete
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </div>
  );
}
