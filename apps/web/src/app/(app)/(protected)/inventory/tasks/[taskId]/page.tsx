"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { faCheck, faXmark } from "@repo/pro-solid-svg-icons";
import { Datatable } from "@repo/ui/components/display";
import { Badge, Button, Icon } from "@repo/ui/components/element";
import { Heading, TextLink } from "@repo/ui/components/typography";

interface TaskPageProps {
  params: { taskId: string };
}

export default function TaskPage({ params }: TaskPageProps) {
  const id = Number(params.taskId);

  const { data: task } = api.task.get.useQuery({
    id,
  });

  const { mutate: completeTask } = api.task.item.complete.useMutation();

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
        endpoint={api.task.item.list}
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
              <Datatable.Column id="componentId" isSortable>
                Component
              </Datatable.Column>
              <Datatable.Column id="batchReference" isSortable>
                Batch Reference
              </Datatable.Column>
              <Datatable.Column id="quantity" isSortable>
                Quantity
              </Datatable.Column>
              <Datatable.Column id="fromLocation" isSortable>
                From
              </Datatable.Column>
              <Datatable.Column id="toLocation" isSortable>
                To
              </Datatable.Column>
              <Datatable.Column id="isCompleted">Completed</Datatable.Column>
              <Datatable.Column id="action"> </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={`${data.id}`}>
                  <Datatable.Cell id="componentId">
                    <TextLink href={`/components/${data.componentId}`}>
                      {data.componentId}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.DecimalCell
                    id="quantity"
                    value={data.quantity}
                    unit={data.componentUnit}
                  />
                  <Datatable.Cell id="batchReference">
                    {data.batchReference}
                  </Datatable.Cell>
                  <Datatable.Cell id="fromLocation">
                    <TextLink
                      href={`/inventory/locations/${data.pickLocationId}`}
                    >
                      {data.pickLocationName}
                    </TextLink>
                    <span className="ml-1 text-content-muted">
                      ({data.pickLocationGroupName})
                    </span>
                  </Datatable.Cell>
                  <Datatable.Cell id="toLocation">
                    <TextLink
                      href={`/inventory/locations/${data.putLocationId}`}
                    >
                      {data.putLocationName}
                    </TextLink>
                    <span className="ml-1 text-content-muted">
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
