"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Heading, TextLink } from "@repo/ui/components/typography";

export default function DespatchesOverview() {
  return (
    <div className="flex h-[calc(100vh-10rem)] max-h-full grow flex-col gap-4">
      <Heading level={1}>Despatches</Heading>

      <DatatableQueryProvider
        endpoint={api.despatching.despatch.list}
        defaultInput={{
          sort: [{ field: "despatchDate", order: "desc" }],
        }}
      >
        {(props) => (
          <Datatable className="grow overflow-hidden" {...props}>
            <Datatable.Head>
              <Datatable.Column id="id" isSortable>
                ID
              </Datatable.Column>
              <Datatable.Column id="customerName" isSortable>
                Customer
              </Datatable.Column>
              <Datatable.Column id="orderId" isSortable>
                Sales Order
              </Datatable.Column>
              <Datatable.Column id="despatchDate" isSortable>
                Despatch Date
              </Datatable.Column>
              <Datatable.Column id="itemCount" isSortable>
                Items
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={`${data.id}`}>
                  <Datatable.Cell id="id">
                    <TextLink href={`/despatching/despatches/${data.id}`}>
                      {data.id}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="customerName">
                    <TextLink href={`/customers/${data.customerId}`}>
                      {data.customerName}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="orderId">
                    <TextLink href={`/despatching/orders/${data.orderId}`}>
                      #{data.orderId}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.DateTimeCell
                    id="despatchDate"
                    value={data.despatchDate}
                  />
                  <Datatable.Cell id="itemCount">
                    {data.itemCount}
                  </Datatable.Cell>
                </Datatable.Row>
              )}
            </Datatable.Body>
          </Datatable>
        )}
      </DatatableQueryProvider>
    </div>
  );
}
