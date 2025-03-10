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

      <DatatableQueryProvider endpoint={api.batch.list} defaultInput={{}}>
        {(props) => (
          <Datatable className="grow overflow-hidden" {...props}>
            <Datatable.Head>
              <Datatable.Column id="batchReference" isSortable>
                Batch Reference
              </Datatable.Column>
              <Datatable.Column id="componentId" isSortable>
                Stock Code
              </Datatable.Column>
              <Datatable.Column id="componentDescription" isSortable>
                Description
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
              <Datatable.Column id="freeQuantity" isSortable>
                Free
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={`${data.id}`}>
                  <Datatable.Cell id="batchReference">
                    #{data.batchReference}
                  </Datatable.Cell>
                  <Datatable.Cell id="componentId">
                    <TextLink href={`/components/${data.componentId}`}>
                      {data.componentId}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="componentDescription">
                    {data.componentDescription}
                  </Datatable.Cell>
                  <Datatable.DateTimeCell
                    id="entryDate"
                    value={data.entryDate}
                  />
                  <Datatable.DecimalCell
                    id="totalQuantity"
                    value={data.totalQuantity}
                    unit={data.componentUnit}
                    precision={6}
                    className="flex flex-row items-baseline space-x-1"
                  />
                  <Datatable.DecimalCell
                    id="allocatedQuantity"
                    value={data.allocatedQuantity}
                    unit={data.componentUnit}
                    precision={6}
                    className="flex flex-row items-baseline space-x-1"
                  />
                  <Datatable.DecimalCell
                    id="freeQuantity"
                    value={data.freeQuantity}
                    unit={data.componentUnit}
                    precision={6}
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
