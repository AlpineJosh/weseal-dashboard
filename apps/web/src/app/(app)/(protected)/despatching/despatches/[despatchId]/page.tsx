"use client";

import { component } from "@/models/component";
import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Heading, TextLink } from "@repo/ui/components/typography";

export default function ReceiptsOverview({
  params,
}: {
  params: { receiptId: string };
}) {
  const id = +params.receiptId;

  return (
    <div className="flex h-[calc(100vh-10rem)] max-h-full grow flex-col gap-4">
      <Heading level={1}>Despatch #{id}</Heading>

      <DatatableQueryProvider
        endpoint={api.receiving.receipt.item.list}
        defaultInput={{
          filter: {
            receiptId: {
              eq: id,
            },
          },
        }}
      >
        {(props) => (
          <Datatable className="grow overflow-hidden" {...props}>
            <Datatable.Head>
              <Datatable.Column id="componentId" isSortable>
                Component
              </Datatable.Column>
              <Datatable.Column id="componentDescription" isSortable>
                Description
              </Datatable.Column>
              <Datatable.Column id="quantity" isSortable>
                Quantity
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={`${data.id}`}>
                  <Datatable.Cell id="componentId">
                    <TextLink
                      href={`/components/${component.encodeURLId(data.componentId)}`}
                    >
                      {data.componentId}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="componentDescription">
                    {data.componentDescription}
                  </Datatable.Cell>
                  <Datatable.DecimalCell id="quantity" value={data.quantity} />
                </Datatable.Row>
              )}
            </Datatable.Body>
          </Datatable>
        )}
      </DatatableQueryProvider>
    </div>
  );
}
