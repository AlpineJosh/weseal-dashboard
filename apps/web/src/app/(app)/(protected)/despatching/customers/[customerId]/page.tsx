"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Heading, Text, TextLink } from "@repo/ui/components/typography";

export default function CustomerOverview({
  params,
}: {
  params: { customerId: string };
}) {
  const { data } = api.despatching.customer.get.useQuery({
    id: params.customerId,
  });

  return (
    <div className="flex h-[calc(100vh-10rem)] max-h-full grow flex-col gap-4">
      <Heading level={1}>{data?.name}</Heading>
      <Text>Sales Orders</Text>

      <DatatableQueryProvider
        endpoint={api.despatching.order.list}
        defaultInput={{
          filter: {
            customerId: {
              eq: params.customerId,
            },
          },
          sort: [{ field: "orderDate", order: "desc" }],
        }}
      >
        {(props) => (
          <Datatable className="grow overflow-hidden" {...props}>
            <Datatable.Head>
              <Datatable.Column id="id" isSortable>
                Order Number
              </Datatable.Column>

              <Datatable.Column id="status">Status</Datatable.Column>
              <Datatable.Column id="orderDate" isSortable>
                Order Date
              </Datatable.Column>
              <Datatable.Column id="totalItems" isSortable>
                Total Items
              </Datatable.Column>
              <Datatable.Column id="incompleteItems" isSortable>
                Incomplete Items
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

                  <Datatable.Cell id="status">
                    <Badge
                      color={
                        data.isQuote
                          ? "orange"
                          : data.isCancelled
                            ? "red"
                            : data.isComplete
                              ? "green"
                              : "yellow"
                      }
                    >
                      {data.isQuote
                        ? "Quoted"
                        : data.isCancelled
                          ? "Cancelled"
                          : data.isComplete
                            ? "Completed"
                            : "Pending"}
                    </Badge>
                  </Datatable.Cell>
                  <Datatable.DateTimeCell
                    id="orderDate"
                    value={data.orderDate}
                  />

                  <Datatable.Cell id="totalItems">
                    {data.totalItems}
                  </Datatable.Cell>
                  <Datatable.Cell id="incompleteItems">
                    {data.incompleteItems}
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
