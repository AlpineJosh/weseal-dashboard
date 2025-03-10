"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Heading, TextLink } from "@repo/ui/components/typography";

export default function ReceiptsOverview() {
  return (
    <div className="flex h-[calc(100vh-10rem)] max-h-full grow flex-col gap-4">
      <Heading level={1}>Receipts</Heading>

      <DatatableQueryProvider
        endpoint={api.receiving.receipt.list}
        defaultInput={{
          sort: [{ field: "receiptDate", order: "desc" }],
        }}
      >
        {(props) => (
          <Datatable className="grow overflow-hidden" {...props}>
            <Datatable.Head>
              <Datatable.Column id="id" isSortable>
                ID
              </Datatable.Column>
              <Datatable.Column id="supplierName" isSortable>
                Supplier
              </Datatable.Column>
              <Datatable.Column id="orderId" isSortable>
                Purchase Order
              </Datatable.Column>
              <Datatable.Column id="receiptDate" isSortable>
                Receipt Date
              </Datatable.Column>
              <Datatable.Column id="itemCount" isSortable>
                Items
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={`${data.id}`}>
                  <Datatable.Cell id="id">
                    <TextLink href={`/receiving/receipts/${data.id}`}>
                      {data.id}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="supplierName">
                    <TextLink href={`/suppliers/${data.supplierId}`}>
                      {data.supplierName}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="orderId">
                    <TextLink href={`/receiving/orders/${data.orderId}`}>
                      #{data.orderId}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="receiptDate">
                    {data.receiptDate?.toLocaleDateString()}
                  </Datatable.Cell>
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
