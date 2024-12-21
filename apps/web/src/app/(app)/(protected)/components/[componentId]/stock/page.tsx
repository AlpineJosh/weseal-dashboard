"use client";

import { batch } from "@/models/batch";
import { component } from "@/models/component";
import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";

export default function StockPage({
  params,
}: {
  params: { componentId: string };
}) {
  const id = component.decodeURLId(params.componentId);

  return (
    <DatatableQueryProvider
      endpoint={api.inventory.quantity}
      defaultInput={{
        filter: {
          componentId: { eq: id },
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
                  {batch.getDisplayId(data.batchReference, data.batchEntryDate)}
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
  );
}
