"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Heading, Text } from "@repo/ui/components/typography";

export default function InventoryOverview() {
  return (
    <div className="flex flex-col gap-4">
      <Heading level={1}>Current Inventory</Heading>
      <Text>A comprehensive view of live stock across all departments</Text>

      <DatatableQueryProvider
        endpoint={api.inventory.quantity}
        defaultInput={{
          filter: {
            total: {
              neq: 0,
            },
          },
        }}
      >
        {(props) => (
          <Datatable {...props}>
            <Datatable.Head>
              <Datatable.Column id="component" isSortable>
                Stock Code
              </Datatable.Column>
              <Datatable.Column id="description" isSortable>
                Description
              </Datatable.Column>
              <Datatable.Column id="batch" isSortable>
                Batch
              </Datatable.Column>
              <Datatable.Column id="location" isSortable>
                Location
              </Datatable.Column>
              <Datatable.Column id="quantity" isSortable>
                Total Quantity
              </Datatable.Column>
              <Datatable.Column id="allocated" isSortable>
                Allocated
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row
                  key={`${data.componentId}-${data.batchId}-${data.locationId}`}
                >
                  <Datatable.Cell id="component">
                    {data.componentId}
                  </Datatable.Cell>
                  <Datatable.Cell id="description">
                    {data.componentDescription}
                  </Datatable.Cell>
                  <Datatable.Cell id="batch">
                    {data.batchReference ??
                      data.batchEntryDate?.toLocaleDateString()}{" "}
                  </Datatable.Cell>
                  <Datatable.Cell id="location">
                    {data.locationName}
                  </Datatable.Cell>
                  <Datatable.NumberCell
                    id="quantity"
                    value={data.total}
                    unit={data.componentUnit}
                    precision={6}
                    className="flex flex-row items-baseline space-x-1"
                  />
                  <Datatable.NumberCell
                    id="allocated"
                    value={data.allocated}
                    unit={data.componentUnit}
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
