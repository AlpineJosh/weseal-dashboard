"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Heading, TextLink } from "@repo/ui/components/typography";

export default function ReceivingOrdersOverview() {
  return (
    <div className="flex h-[calc(100vh-10rem)] max-h-full grow flex-col gap-4">
      <Heading level={1}>Sales Orders</Heading>

      <DatatableQueryProvider
        endpoint={api.despatching.order.list}
        defaultInput={{
          sort: [{ field: "orderDate", order: "desc" }],
        }}
      >
        {(props) => (
          <Datatable className="grow overflow-hidden" {...props}>
            <Datatable.Head>
              <Datatable.Column id="id" isSortable>
                Order Number
              </Datatable.Column>
              <Datatable.Column id="customerName" isSortable>
                Customer
              </Datatable.Column>
              <Datatable.Column id="status">Status</Datatable.Column>
              <Datatable.Column id="orderDate" isSortable>
                Order Date
              </Datatable.Column>
              <Datatable.Column id="nextExpectedDespatch" isSortable>
                Next Despatch
              </Datatable.Column>
              <Datatable.Column id="despatchCount" isSortable>
                Despatches Sent
              </Datatable.Column>
              <Datatable.Column id="remainingItemCount" isSortable>
                Items Remaining
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={`${data.id}`}>
                  <Datatable.Cell id="id">
                    <TextLink href={`/despatching/orders/${data.id}`}>
                      {data.id}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="customerName">
                    <TextLink href={`/customers/${data.customerId}`}>
                      {data.customerName}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="status">
                    <Badge
                      color={
                        data.isQuote
                          ? "orange"
                          : data.isCancelled
                            ? "red"
                            : data.remainingItemCount === 0
                              ? "green"
                              : "yellow"
                      }
                    >
                      {data.isQuote
                        ? "Quoted"
                        : data.isCancelled
                          ? "Cancelled"
                          : data.remainingItemCount === 0
                            ? "Completed"
                            : "Pending"}
                    </Badge>
                  </Datatable.Cell>
                  <Datatable.Cell id="orderDate">
                    {data.orderDate?.toLocaleDateString()}
                  </Datatable.Cell>
                  <Datatable.Cell id="nextExpectedDespatch">
                    {data.nextExpectedDespatch?.toLocaleDateString()}
                  </Datatable.Cell>
                  <Datatable.Cell id="despatchCount">
                    {data.despatchCount}
                  </Datatable.Cell>
                  <Datatable.Cell id="remainingItemCount">
                    {data.remainingItemCount}
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
