"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Heading, Text, TextLink } from "@repo/ui/components/typography";

export default function InventoryOverview() {
  return (
    <div className="flex h-[calc(100vh-10rem)] max-h-full grow flex-col gap-4">
      <Heading level={1}>Current Inventory</Heading>
      <Text>A comprehensive view of live stock across all departments</Text>

      <DatatableQueryProvider
        endpoint={api.inventory.list}
        defaultInput={{
          filter: {
            totalQuantity: {
              neq: 0,
            },
            isStockTracked: {
              eq: true,
            },
          },
        }}
      >
        {(props) => (
          <Datatable className="grow overflow-hidden" {...props}>
            <Datatable.Head>
              <Datatable.Column id="component" isSortable>
                Stock Code
              </Datatable.Column>
              <Datatable.Column id="description" isSortable>
                Description
              </Datatable.Column>
              <Datatable.Column id="location" isSortable>
                Location
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
                <Datatable.Row
                  key={`${data.componentId}-${data.batchId}-${data.locationId}`}
                >
                  <Datatable.Cell id="component">
                    <TextLink href={`/components/${data.componentId}`}>
                      {data.componentId}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="description">
                    {data.componentDescription}
                  </Datatable.Cell>
                  <Datatable.Cell id="location">
                    <TextLink href={`/inventory/locations/${data.locationId}`}>
                      {data.locationName}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.DecimalCell
                    id="totalQuantity"
                    value={data.totalQuantity}
                    unit={data.componentUnit}
                    className="flex flex-row items-baseline space-x-1"
                  />
                  <Datatable.DecimalCell
                    id="allocatedQuantity"
                    value={data.allocatedQuantity}
                    unit={data.componentUnit}
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
