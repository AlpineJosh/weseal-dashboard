"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Heading, TextLink } from "@repo/ui/components/typography";

export default function DespatchingPage() {
  return (
    <div className="flex flex-col gap-4">
      <Heading level={1}>Sales Orders</Heading>

      <DatatableQueryProvider
        endpoint={api.despatching.order.list}
        defaultInput={{
          sort: [{ field: "orderDate" as const, order: "desc" }],
        }}
      >
        {(props) => (
          <Datatable {...props}>
            <Datatable.Head>
              <Datatable.Column id="id" isSortable>
                Order Number
              </Datatable.Column>
              <Datatable.Column id="customer" isSortable>
                Customer
              </Datatable.Column>
              <Datatable.Column id="status" isSortable>
                Status
              </Datatable.Column>
              <Datatable.Column id="orderDate" isSortable>
                Order Date
              </Datatable.Column>
              <Datatable.Column id="despatchCount" isSortable>
                Deliveries Sent
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={data.id}>
                  <Datatable.Cell id="id">
                    <TextLink href={`/despatching/orders/${data.id}`}>
                      {data.id}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="customer">
                    <TextLink
                      href={`/despatching/customers/${data.customerId}`}
                    >
                      {data.customerName}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="status">
                    <Badge
                      color={
                        data.isCancelled
                          ? "red"
                          : data.isComplete
                            ? "green"
                            : "yellow"
                      }
                    >
                      {data.isCancelled
                        ? "Cancelled"
                        : data.isComplete
                          ? "Completed"
                          : "Pending"}
                    </Badge>
                  </Datatable.Cell>
                  <Datatable.Cell id="orderDate">
                    {data.orderDate?.toLocaleDateString()}
                  </Datatable.Cell>

                  <Datatable.Cell id="despatchCount">
                    {data.despatchCount}
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
