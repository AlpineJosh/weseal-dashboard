"use client";

import { component } from "@/models/component";
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
        endpoint={api.receiving.order.item.list}
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
              <Datatable.Column id="componentId">Component</Datatable.Column>
              <Datatable.Column id="description">Description</Datatable.Column>
              <Datatable.Column id="quantityOrdered">Ordered</Datatable.Column>
              <Datatable.Column id="quantityReceived">
                Received
              </Datatable.Column>
              <Datatable.Column id="sageQuantityReceived">
                Sage Received
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data: item }) => (
                <Datatable.Row key={item.id}>
                  <Datatable.Cell id="componentId">
                    <TextLink
                      href={`/components/${component.encodeURLId(item.componentId)}`}
                    >
                      {item.componentId}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="description">
                    {item.componentDescription}
                  </Datatable.Cell>
                  <Datatable.DecimalCell
                    id="quantityOrdered"
                    value={item.quantityOrdered}
                    unit={item.componentUnit}
                  />
                  <Datatable.DecimalCell
                    id="quantityReceived"
                    value={item.quantityReceived}
                    unit={item.componentUnit}
                  />
                  <Datatable.DecimalCell
                    id="sageQuantityReceived"
                    value={item.sageQuantityReceived}
                    unit={item.componentUnit}
                  />
                </Datatable.Row>
              )}
            </Datatable.Body>
          </Datatable>
        )}
      </DatatableQueryProvider>
    </>
  );
}
