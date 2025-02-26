"use client";

import { batch } from "@/models/batch";
import { component } from "@/models/component";
import { movementType } from "@/models/movement";
import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";

export default function HistoryPage({
  params,
}: {
  params: { componentId: string };
}) {
  const id = component.decodeURLId(params.componentId);

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
            <Datatable.Column id="batchReference" isSortable>
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
                  <Badge color={movementType[data.type]?.color}>
                    {movementType[data.type]?.label}
                  </Badge>
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
