"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Heading, TextLink } from "@repo/ui/components/typography";

export default function TasksPage() {
  return (
    <div className="flex h-[calc(100vh-10rem)] max-h-full grow flex-col gap-4">
      <Heading level={1}>Tasks</Heading>

      <DatatableQueryProvider endpoint={api.task.list} defaultInput={{}}>
        {(props) => (
          <Datatable className="grow overflow-hidden" {...props}>
            <Datatable.Head>
              <Datatable.Column id="id" isSortable>
                ID
              </Datatable.Column>
              <Datatable.Column id="type" isSortable>
                Type
              </Datatable.Column>
              <Datatable.Column id="incompleteItemCount" isSortable>
                Items
              </Datatable.Column>
              <Datatable.Column id="assignedToName" isSortable>
                Assigned To
              </Datatable.Column>
              <Datatable.Column id="isCompleted" isSortable>
                Completed
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={`${data.id}`}>
                  <Datatable.Cell id="id">
                    <TextLink href={`/inventory/tasks/${data.id}`}>
                      {data.id}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="type">
                    <Badge>{data.type}</Badge>
                  </Datatable.Cell>

                  <Datatable.Cell id="incompleteItemCount">
                    {data.incompleteItemCount} / {data.itemCount}
                  </Datatable.Cell>

                  <Datatable.Cell id="assignedToName">
                    {data.assignedToName}
                  </Datatable.Cell>
                  <Datatable.Cell id="isCompleted">
                    {data.itemsComplete ? "Yes" : "No"}
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
