"use client";

import { component } from "@/models/component";
import { Ledger } from "@/models/ledger";
import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";

export default function HistoryPage({
  params,
}: {
  params: { componentId: string };
}) {
  const id = component.decodeURLId(params.componentId);

  const { data: componentDetails } = api.component.get.useQuery({ id });

  return (
    <DatatableQueryProvider
      endpoint={api.inventory.ledger.list}
      defaultInput={{
        filter: {
          componentId: { eq: id },
        },
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
            <Datatable.Column id="type" isSortable>
              Type
            </Datatable.Column>
            <Datatable.Column
              id="batchReference"
              isSortable
              hidden={!componentDetails?.isBatchTracked}
            >
              Batch
            </Datatable.Column>

            <Datatable.Column id="locationName" isSortable>
              Location
            </Datatable.Column>
            <Datatable.Column id="quantity" isSortable>
              Quantity
            </Datatable.Column>
          </Datatable.Head>
          <Datatable.Body data={props.data}>
            {({ data }) => (
              <Datatable.Row key={`${data.id}`}>
                <Datatable.DateTimeCell
                  id="date"
                  value={data.date}
                  includeTime
                />
                <Datatable.Cell id="type">
                  <Ledger.Badge type={data.type} />
                </Datatable.Cell>
                <Datatable.Cell id="batchReference">
                  #{data.batchReference}
                </Datatable.Cell>
                <Datatable.Cell id="locationName">
                  {data.locationName}
                </Datatable.Cell>
                <Datatable.DecimalCell
                  id="quantity"
                  value={data.quantity}
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
