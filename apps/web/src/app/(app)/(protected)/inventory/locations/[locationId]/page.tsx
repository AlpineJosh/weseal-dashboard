"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { faCheck, faXmark } from "@repo/pro-solid-svg-icons";
import { Datatable } from "@repo/ui/components/display";
import { Badge, Button, Icon } from "@repo/ui/components/element";
import { Heading, Text } from "@repo/ui/components/typography";

interface LocationPageProps {
  params: { locationId: string };
}

export default function LocationPage({ params }: LocationPageProps) {
  const id = Number(params.locationId);

  const { data: location } = api.inventory.locations.get.useQuery({
    id,
  });

  return (
    <div className="flex max-w-screen-xl grow flex-col space-y-4">
      {location && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Heading level={1}>Location: {location.name}</Heading>
            <Text>{location.groupName}</Text>
          </div>
        </div>
      )}

      <DatatableQueryProvider
        endpoint={api.inventory.quantity}
        defaultInput={{
          filter: {
            locationId: {
              eq: id,
            },
          },
        }}
      >
        {(props) => (
          <Datatable {...props}>
            <Datatable.Head>
              <Datatable.Column id="componentId">Component</Datatable.Column>
              <Datatable.Column id="batchReference">
                Batch Reference
              </Datatable.Column>
              <Datatable.Column id="total">Quantity</Datatable.Column>
              <Datatable.Column id="free">Free</Datatable.Column>
              <Datatable.Column id="allocated">Allocated</Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={`${data.componentId}`}>
                  <Datatable.Cell id="componentId">
                    {data.componentId}
                  </Datatable.Cell>
                  <Datatable.Cell id="batchReference">
                    {data.batchReference}
                  </Datatable.Cell>
                  <Datatable.NumberCell
                    id="total"
                    value={data.total}
                    unit={data.componentUnit}
                  />
                  <Datatable.NumberCell
                    id="free"
                    value={data.free}
                    unit={data.componentUnit}
                  />
                  <Datatable.NumberCell
                    id="allocated"
                    value={data.allocated}
                    unit={data.componentUnit}
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
