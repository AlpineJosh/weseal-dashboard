"use client";

import { component } from "@/models/component";
import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { TextLink } from "@repo/ui/components/typography";

export default function StockPage({
  params,
}: {
  params: { componentId: string };
}) {
  const id = component.decodeURLId(params.componentId);

  return (
    <DatatableQueryProvider
      endpoint={api.inventory.list}
      defaultInput={{
        filter: {
          componentId: { eq: id },
          totalQuantity: { neq: 0 },
        },
      }}
    >
      {(props) => (
        <Datatable {...props}>
          <Datatable.Head>
            <Datatable.Column id="locationName" isSortable>
              Location
            </Datatable.Column>
            <Datatable.Column id="batchReference" isSortable>
              Batch
            </Datatable.Column>
            <Datatable.Column id="entryDate" isSortable>
              Entry Date
            </Datatable.Column>
            <Datatable.Column id="age">Age</Datatable.Column>
            <Datatable.Column id="totalQuantity" isSortable>
              Total Quantity
            </Datatable.Column>
            <Datatable.Column id="allocatedQuantity" isSortable>
              Allocated Quantity
            </Datatable.Column>
          </Datatable.Head>
          <Datatable.Body data={props.data}>
            {({ data }) => (
              <Datatable.Row key={`${data.batchId}-${data.locationId}`}>
                <Datatable.Cell id="locationName">
                  <TextLink href={`/inventory/locations/${data.locationId}`}>
                    {data.locationName}
                  </TextLink>
                </Datatable.Cell>
                <Datatable.Cell id="batchReference">
                  <TextLink href={`/inventory/batches/${data.batchId}`}>
                    #{data.batchReference}
                  </TextLink>
                </Datatable.Cell>
                <Datatable.Cell id="entryDate">
                  {data.entryDate.toLocaleDateString()}
                </Datatable.Cell>
                <Datatable.Cell id="age">
                  {Math.floor(
                    (new Date().getTime() - data.entryDate.getTime()) /
                      (1000 * 60 * 60 * 24),
                  )}{" "}
                  days
                </Datatable.Cell>
                <Datatable.DecimalCell
                  id="totalQuantity"
                  value={data.totalQuantity}
                  unit={data.componentUnit}
                />
                <Datatable.DecimalCell
                  id="allocatedQuantity"
                  value={data.allocatedQuantity}
                  unit={data.componentUnit}
                />
              </Datatable.Row>
            )}
          </Datatable.Body>
        </Datatable>
      )}
    </DatatableQueryProvider>
  );
}
