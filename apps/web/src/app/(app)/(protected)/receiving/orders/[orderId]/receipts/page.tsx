"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { TextLink } from "@repo/ui/components/typography";

export default function ReceivingPage({
  params,
}: {
  params: { orderId: string };
}) {
  const id = +params.orderId;

  return (
    <>
      <DatatableQueryProvider
        endpoint={api.receiving.receipt.list}
        defaultInput={{
          filter: {
            orderId: {
              eq: id,
            },
          },
        }}
      >
        {(props) => (
          <Datatable {...props}>
            <Datatable.Head>
              <Datatable.Column id="id">Receipt ID</Datatable.Column>
              <Datatable.Column id="receiptDate">Receipt Date</Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data: item }) => (
                <Datatable.Row key={item.id}>
                  <Datatable.Cell id="id">
                    <TextLink href={`/receiving/receipts/${item.id}`}>
                      {item.id}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="receiptDate">
                    {item.receiptDate?.toLocaleDateString()}
                  </Datatable.Cell>
                </Datatable.Row>
              )}
            </Datatable.Body>
          </Datatable>
        )}
      </DatatableQueryProvider>
    </>
  );
}
