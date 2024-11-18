"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Heading } from "@repo/ui/components/typography";

export default function ReceivingPage() {
  return (
    <div className="flex flex-col gap-4">
      <Heading level={1}>Purchase Orders</Heading>

      <DatatableQueryProvider
        endpoint={api.receiving.orders.list}
        defaultInput={{
          sort: [{ field: "orderDate", order: "desc" }],
        }}
      >
        {(props) => (
          <Datatable {...props}>
            <Datatable.Head>
              <Datatable.Column id="id" isSortable>
                Order Number
              </Datatable.Column>
              <Datatable.Column id="supplier" isSortable>
                Supplier
              </Datatable.Column>
              <Datatable.Column id="status" isSortable>
                Status
              </Datatable.Column>
              <Datatable.Column id="orderDate" isSortable>
                Order Date
              </Datatable.Column>
              <Datatable.Column id="nextExpectedReceipt" isSortable>
                Due Date
              </Datatable.Column>
              <Datatable.Column id="receiptCount" isSortable>
                Deliveries Received
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={data.id}>
                  <Datatable.Cell id="id">{data.id}</Datatable.Cell>
                  <Datatable.Cell id="supplier">
                    {data.supplierName}
                  </Datatable.Cell>
                  <Datatable.Cell id="status">
                    <Badge>
                      {data.isQuote
                        ? "Quoted"
                        : data.isCancelled
                          ? "Cancelled"
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
                </Datatable.Row>
              )}
            </Datatable.Body>
          </Datatable>
        )}
      </DatatableQueryProvider>
    </div>
  );
}
