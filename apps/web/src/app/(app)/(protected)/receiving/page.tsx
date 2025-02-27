"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Heading, TextLink } from "@repo/ui/components/typography";

export default function ReceivingPage() {
  return (
    <div className="flex flex-col gap-4">
      <Heading level={1}>Purchase Orders</Heading>

      <DatatableQueryProvider
        endpoint={api.receiving.order.list}
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
              <Datatable.Column id="supplierName" isSortable>
                Supplier
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
                <Datatable.Row key={data.id}>
                  <Datatable.Cell id="id">
                    <TextLink href={`/receiving/orders/${data.id}`}>
                      #{data.id}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="supplierName">
                    <TextLink href={`/suppliers/${data.supplierId}`}>
                      {data.supplierName}
                    </TextLink>
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
