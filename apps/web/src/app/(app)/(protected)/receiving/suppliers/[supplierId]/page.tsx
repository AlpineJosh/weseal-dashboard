"use client";

import { Datatable } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Heading, Text, TextLink } from "@repo/ui/components/typography";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

export default function SupplierOverview({
  params,
}: {
  params: { supplierId: string };
}) {
  const { data } = api.receiving.supplier.get.useQuery({
    id: params.supplierId,
  });

  return (
    <div className="flex h-[calc(100vh-10rem)] max-h-full grow flex-col gap-4">
      <Heading level={1}>{data?.name}</Heading>
      <Text>Purchase Orders</Text>

      <DatatableQueryProvider
        endpoint={api.receiving.order.list}
        defaultInput={{
          filter: {
            supplierId: {
              eq: params.supplierId,
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

                  <Datatable.Cell id="status">
                    <Badge
                      color={
                        data.isQuote
                          ? "orange"
                          : data.isCancelled
                            ? "red"
                            : data.incompleteItems === 0
                              ? "green"
                              : "yellow"
                      }
                    >
                      {data.isQuote
                        ? "Quoted"
                        : data.isCancelled
                          ? "Cancelled"
                          : data.incompleteItems === 0
                            ? "Received"
                            : "Pending"}
                    </Badge>
                  </Datatable.Cell>
                  <Datatable.Cell id="orderDate">
                    {data.orderDate?.toLocaleDateString()}
                  </Datatable.Cell>

                  <Datatable.Cell id="remainingItemCount">
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
