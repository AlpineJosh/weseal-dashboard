"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Badge, Divider } from "@repo/ui/components/element";
import { Heading, Subheading, Text } from "@repo/ui/components/typography";

export default function ComponentPage({
  params,
}: {
  params: { componentId: string };
}) {
  const { data } = api.component.get.useQuery({
    id: params.componentId,
  });

  const { data: subcomponents } = api.component.subcomponents.useQuery({
    componentId: params.componentId,
  });
  return (
    <div className="w-full max-w-screen-xl">
      {data && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Heading level={1}>{data.id}</Heading>
            <Text className="text-content-muted">{data.description}</Text>
            <div className="mt-1 flex flex-row space-x-2">
              <Badge color="primary">Department: {data.departmentName}</Badge>
              <Badge color="secondary">Category: {data.categoryName}</Badge>
            </div>
          </div>
          <Divider />
          <div className="flex w-full flex-row justify-stretch space-x-4">
            <div className="flex flex-1 flex-col space-y-2 p-2">
              <h3 className="text-muted-foreground">Quantity In Stock</h3>
              <span className="flex flex-row items-baseline space-x-1">
                <span className="text-2xl font-semibold">
                  {data.totalQuantity}
                </span>
                <span className="text-muted-foreground">{data.unit}</span>
              </span>
            </div>
            <Divider orientation="vertical" />
            <div className="flex flex-1 flex-col space-y-2 p-2">
              <h3 className="text-muted-foreground">Allocated</h3>
              <span className="flex flex-row items-baseline justify-end space-x-1">
                <span className="text-2xl font-semibold">
                  {data.allocatedQuantity}
                </span>
                <span className="text-muted-foreground">{data.unit}</span>
              </span>
            </div>
            <Divider orientation="vertical" />
            <div className="flex flex-1 flex-col space-y-2 p-2">
              <h3 className="text-muted-foreground">Free</h3>
              <span className="flex flex-row items-baseline justify-end space-x-1">
                <span className="text-2xl font-semibold">
                  {data.freeQuantity}
                </span>
                <span className="text-muted-foreground">{data.unit}</span>
              </span>
            </div>
            <Divider orientation="vertical" />
            <div className="flex flex-1 flex-col space-y-2 p-2">
              <h3 className="text-muted-foreground">Quantity In Sage</h3>
              <span className="flex flex-row items-baseline justify-end space-x-1">
                <span className="text-2xl font-semibold">
                  {data.sageQuantity}
                </span>
                <span className="text-muted-foreground">{data.unit}</span>
              </span>
            </div>
          </div>

          <Divider />
          <Subheading>Current Inventory</Subheading>
          <DatatableQueryProvider
            endpoint={api.inventory.quantity}
            defaultInput={{
              filter: {
                componentId: { eq: params.componentId },
                total: { neq: 0 },
              },
            }}
          >
            {(props) => (
              <Datatable {...props}>
                <Datatable.Head>
                  <Datatable.Column id="batchReference" isSortable>
                    Batch
                  </Datatable.Column>
                  <Datatable.Column id="locationName" isSortable>
                    Location
                  </Datatable.Column>
                  <Datatable.Column id="total" isSortable>
                    Quantity
                  </Datatable.Column>
                </Datatable.Head>
                <Datatable.Body data={props.data}>
                  {({ data }) => (
                    <Datatable.Row key={`${data.batchId}-${data.locationId}`}>
                      <Datatable.Cell id="batchReference">
                        {data.batchReference ??
                          data.batchEntryDate?.toLocaleDateString()}
                      </Datatable.Cell>
                      <Datatable.Cell id="locationName">
                        {data.locationName}
                      </Datatable.Cell>
                      <Datatable.NumberCell
                        id="total"
                        value={data.total}
                        unit={data.componentUnit}
                      />
                    </Datatable.Row>
                  )}
                </Datatable.Body>
              </Datatable>
            )}
          </DatatableQueryProvider>
          <Divider />
          {data.hasSubcomponents && (
            <>
              <Subheading>Subcomponents</Subheading>
              <Datatable>
                <Datatable.Head>
                  <Datatable.Column id="id">ID</Datatable.Column>
                  <Datatable.Column id="description">
                    Description
                  </Datatable.Column>
                  <Datatable.Column id="total">Quantity</Datatable.Column>
                </Datatable.Head>
                <Datatable.Body data={subcomponents}>
                  {({ data }) => (
                    <Datatable.Row key={data.id}>
                      <Datatable.Cell id="id">{data.id}</Datatable.Cell>
                      <Datatable.Cell id="description">
                        {data.subcomponent.description}
                      </Datatable.Cell>
                      <Datatable.NumberCell
                        id="total"
                        value={data.quantity}
                        unit={data.subcomponent.unit}
                      />
                    </Datatable.Row>
                  )}
                </Datatable.Body>
              </Datatable>
            </>
          )}
          <Divider />
          <Subheading>Movements</Subheading>
          <DatatableQueryProvider
            endpoint={api.inventory.movements.list}
            defaultInput={{
              filter: { componentId: { eq: params.componentId } },
              sort: [
                {
                  field: "date",
                  order: "desc",
                },
              ],
            }}
          >
            {(props) => (
              <Datatable {...props}>
                <Datatable.Head>
                  <Datatable.Column id="date" isSortable>
                    Date
                  </Datatable.Column>
                  <Datatable.Column id="locationName">
                    Location
                  </Datatable.Column>
                  <Datatable.Column id="batchReference">
                    Batch Reference
                  </Datatable.Column>
                  <Datatable.Column id="quantity">Quantity</Datatable.Column>
                </Datatable.Head>
                <Datatable.Body data={props.data}>
                  {({ data }) => (
                    <Datatable.Row key={data.id}>
                      <Datatable.Cell id="date">
                        {data.date.toLocaleDateString()}
                      </Datatable.Cell>
                      <Datatable.Cell id="locationName">
                        {data.locationName}
                      </Datatable.Cell>
                      <Datatable.Cell id="batchReference">
                        {data.batchReference ??
                          data.batchEntryDate?.toLocaleDateString()}
                      </Datatable.Cell>
                      <Datatable.NumberCell
                        id="quantity"
                        value={data.quantity ?? 0}
                        unit={data.componentUnit}
                      />
                    </Datatable.Row>
                  )}
                </Datatable.Body>
              </Datatable>
            )}
          </DatatableQueryProvider>
        </div>
      )}
    </div>
  );
}
