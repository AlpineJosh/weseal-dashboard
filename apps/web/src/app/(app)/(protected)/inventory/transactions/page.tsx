"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";
import { format } from "date-fns";

import { Datatable } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Heading } from "@repo/ui/components/typography";

const MOVEMENT_TYPES: Record<
  | "production"
  | "despatch"
  | "receipt"
  | "transfer"
  | "correction"
  | "wastage"
  | "lost"
  | "found",
  {
    title: string;
    color: "green" | "purple" | "blue" | "orange" | "red" | "rose" | "teal";
  }
> = {
  production: { title: "Production", color: "green" },
  despatch: { title: "Despatch", color: "purple" },
  receipt: { title: "Receipt", color: "green" },
  transfer: { title: "Transfer", color: "blue" },
  correction: { title: "Correction", color: "orange" },
  wastage: { title: "Wastage", color: "red" },
  lost: { title: "Lost", color: "rose" },
  found: { title: "Found", color: "teal" },
};

export default function InventoryOverview() {
  return (
    <div className="flex flex-col gap-4">
      <Heading level={1}>Transaction Log</Heading>
      <DatatableQueryProvider
        endpoint={api.inventory.movements.list}
        defaultInput={{
          sort: [{ field: "date", order: "desc" }],
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
              <Datatable.Column id="component" isSortable>
                Stock Code
              </Datatable.Column>
              <Datatable.Column id="batch" isSortable>
                Batch Reference
              </Datatable.Column>
              <Datatable.Column id="location" isSortable>
                Location
              </Datatable.Column>
              <Datatable.Column id="quantity" isSortable>
                Quantity
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={data.id}>
                  <Datatable.Cell id="date">
                    {format(data.date, "dd/MM/yy HH:mm")}
                  </Datatable.Cell>
                  <Datatable.Cell id="type">
                    {data.type && (
                      <Badge color={MOVEMENT_TYPES[data.type].color}>
                        {MOVEMENT_TYPES[data.type].title}
                      </Badge>
                    )}
                  </Datatable.Cell>
                  <Datatable.Cell id="component">
                    {data.componentId}
                  </Datatable.Cell>
                  <Datatable.Cell id="batch">
                    {data.batchReference ??
                      data.batchEntryDate?.toLocaleDateString()}
                  </Datatable.Cell>
                  <Datatable.Cell id="location">
                    {data.locationName}
                  </Datatable.Cell>
                  <Datatable.DecimalCell
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
  );
}
