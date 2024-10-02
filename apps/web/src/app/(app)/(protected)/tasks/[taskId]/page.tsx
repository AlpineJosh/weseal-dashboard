"use client";

import { api } from "@/utils/trpc/react";

import { Table } from "@repo/ui/components/display";
import { Badge, Button } from "@repo/ui/components/element";
import { Card } from "@repo/ui/components/layout";

export default function TaskPage({ params }: { params: { taskId: string } }) {
  const utils = api.useUtils();
  const { data: task } = api.task.get.useQuery({ id: Number(params.taskId) });
  const { mutate: completeItem } = api.task.completeItem.useMutation({
    onSuccess: () => {
      utils.task.get.invalidate({ id: Number(params.taskId) });
    },
  });

  return (
    <Card className="overflow-hidden">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Stock Code</Table.Head>
            <Table.Head>Quantity</Table.Head>
            <Table.Head>Batch</Table.Head>
            <Table.Head>From Location</Table.Head>
            <Table.Head>To Location</Table.Head>
            <Table.Head>Status</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {task?.items.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.batch.component.id}</Table.Cell>
              <Table.Cell>{item.quantity}</Table.Cell>
              <Table.Cell>{item.batch.batchReference}</Table.Cell>
              <Table.Cell>{item.pickLocation?.name}</Table.Cell>
              <Table.Cell>{item.putLocation?.name}</Table.Cell>
              <Table.Cell>
                <Badge variant={item.isComplete ? "secondary" : "default"}>
                  {item.isComplete ? "Complete" : "Incomplete"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                {!item.isComplete && (
                  <Button
                    variant="accent"
                    size="sm"
                    onPress={() => completeItem({ id: item.id })}
                  >
                    Mark Complete
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
}
