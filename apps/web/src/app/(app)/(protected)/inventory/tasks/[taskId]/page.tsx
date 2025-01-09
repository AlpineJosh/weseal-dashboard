"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { faCheck, faXmark } from "@repo/pro-solid-svg-icons";
import { Datatable } from "@repo/ui/components/display";
import { Badge, Button, Icon } from "@repo/ui/components/element";
import { Heading } from "@repo/ui/components/typography";

interface TaskPageProps {
  params: { taskId: string };
}

export default function TaskPage({ params }: TaskPageProps) {
  const id = Number(params.taskId);

  const { data: task } = api.inventory.tasks.get.useQuery({
    id,
  });

  const { mutate: completeTask } =
    api.inventory.tasks.items.complete.useMutation();

  return (
    <div className="flex max-w-screen-xl grow flex-col space-y-4">
      {task && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Heading level={1}>Task #{task.id}</Heading>
            <div className="flex flex-col items-start space-y-2">
              <Badge color="primary">{task.type}</Badge>
              <Badge color="secondary">
                Assigned to: {task.assignedToName}
              </Badge>
            </div>
          </div>
        </div>
      )}

      <DatatableQueryProvider
        endpoint={api.inventory.tasks.items.list}
        defaultInput={{
          filter: {
            taskId: {
              eq: id,
            },
          },
        }}
      >
        {(props) => (
          <Datatable {...props}>
            <Datatable.Head>
              <Datatable.Column id="componentId">Component</Datatable.Column>
              <Datatable.Column id="quantity">Quantity</Datatable.Column>
              <Datatable.Column id="batchReference">
                Batch Reference
              </Datatable.Column>
              <Datatable.Column id="fromLocation">From</Datatable.Column>
              <Datatable.Column id="toLocation">To</Datatable.Column>
              <Datatable.Column id="isCompleted">Completed</Datatable.Column>
              <Datatable.Column id="action">Action</Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={`${data.id}`}>
                  <Datatable.Cell id="componentId">
                    {data.componentId}
                  </Datatable.Cell>
                  <Datatable.Cell id="quantity">{data.quantity}</Datatable.Cell>
                  <Datatable.Cell id="batchReference">
                    {data.batchReference}
                  </Datatable.Cell>
                  <Datatable.Cell id="fromLocation">
                    {data.pickLocationName}{" "}
                    <span className="text-content-muted">
                      ({data.pickLocationGroupName})
                    </span>
                  </Datatable.Cell>
                  <Datatable.Cell id="toLocation">
                    {data.putLocationName}{" "}
                    <span className="text-content-muted">
                      ({data.putLocationGroupName})
                    </span>
                  </Datatable.Cell>
                  <Datatable.Cell id="isCompleted">
                    <Icon icon={data.isComplete ? faCheck : faXmark} />
                  </Datatable.Cell>
                  <Datatable.Cell id="action">
                    {!data.isComplete && (
                      <Button onPress={() => completeTask({ id: data.id })}>
                        Complete
                      </Button>
                    )}
                  </Datatable.Cell>
                </Datatable.Row>
              )}
            </Datatable.Body>
          </Datatable>
        )}
      </DatatableQueryProvider>
    </div>
  );
}
