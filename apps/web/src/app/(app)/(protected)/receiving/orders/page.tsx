"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Heading, TextLink } from "@repo/ui/components/typography";

export default function ReceivingOrdersOverview() {
  return (
    <div className="flex h-[calc(100vh-10rem)] max-h-full grow flex-col gap-4">
      <Heading level={1}>Purchase Orders</Heading>

      <DatatableQueryProvider
        endpoint={api.receiving.orders.list}
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
              <Datatable.Column id="supplierName" isSortable>
                Supplier
              </Datatable.Column>
              <Datatable.Column id="status">Status</Datatable.Column>
              <Datatable.Column id="orderDate" isSortable>
                Order Date
              </Datatable.Column>
              <Datatable.Column id="nextExpectedReceipt" isSortable>
                Next Due Date
              </Datatable.Column>
              <Datatable.Column id="receiptCount" isSortable>
                Deliveries Received
              </Datatable.Column>
              <Datatable.Column id="remainingItemCount" isSortable>
                Items Remaining
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={`${data.id}`}>
                  <Datatable.Cell id="id">
                    <TextLink href={`/receiving/orders/${data.id}`}>
                      {data.id}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="supplierName">
                    <TextLink href={`/suppliers/${data.supplierId}`}>
                      {data.supplierName}
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
                            ? "Received"
                            : "Pending"}
                    </Badge>
                  </Datatable.Cell>
                  <Datatable.Cell id="orderDate">
                    {data.orderDate?.toLocaleDateString()}
                  </Datatable.Cell>
                  <Datatable.Cell id="nextExpectedReceipt">
                    {data.nextExpectedReceipt?.toLocaleDateString()}
                  </Datatable.Cell>
                  <Datatable.Cell id="receiptCount">
                    {data.receiptCount}
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
