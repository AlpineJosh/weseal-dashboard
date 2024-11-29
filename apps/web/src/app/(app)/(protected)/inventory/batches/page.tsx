"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Heading, Text, TextLink } from "@repo/ui/components/typography";

export default function BatchOverview() {
  return (
    <div className="flex h-[calc(100vh-10rem)] max-h-full grow flex-col gap-4">
      <Heading level={1}>Batches</Heading>
      <Text>All batches both active and historical</Text>

      <DatatableQueryProvider
        endpoint={api.inventory.batches.list}
        defaultInput={{}}
      >
        {(props) => (
          <Datatable className="grow overflow-hidden" {...props}>
            <Datatable.Head>
              <Datatable.Column id="id" isSortable>
                ID
              </Datatable.Column>
              <Datatable.Column id="componentId" isSortable>
                Stock Code
              </Datatable.Column>
              <Datatable.Column id="componentDescription" isSortable>
                Description
              </Datatable.Column>
              <Datatable.Column id="batchReference" isSortable>
                Batch
              </Datatable.Column>
              <Datatable.Column id="entryDate" isSortable>
                Entry Date
              </Datatable.Column>
              <Datatable.Column id="totalQuantity" isSortable>
                Total Quantity
              </Datatable.Column>
              <Datatable.Column id="allocatedQuantity" isSortable>
                Allocated
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={`${data.id}`}>
                  <Datatable.Cell id="id">
                    <TextLink href={`/inventory/batches/${data.id}`}>
                      {data.id}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="componentId">
                    <TextLink href={`/components/${data.componentId}`}>
                      {data.componentId}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="componentDescription">
                    {data.componentDescription}
                  </Datatable.Cell>
                  <Datatable.Cell id="batchReference">
                    {data.batchReference}
                  </Datatable.Cell>
                  <Datatable.Cell id="entryDate">
                    {data.entryDate?.toLocaleDateString()}
                  </Datatable.Cell>
                  <Datatable.NumberCell
                    id="totalQuantity"
                    value={data.totalQuantity ?? 0}
                    unit={data.unit}
                    precision={6}
                    className="flex flex-row items-baseline space-x-1"
                  />
                  <Datatable.NumberCell
                    id="allocatedQuantity"
                    value={data.allocatedQuantity ?? 0}
                    unit={data.unit}
                    precision={6}
                    className="flex flex-row items-baseline space-x-1"
                  />
                </Datatable.Row>
              )}
            </Datatable.Body>
          </Datatable>
        )}
      </DatatableQueryProvider>
    </div>
  );
}
