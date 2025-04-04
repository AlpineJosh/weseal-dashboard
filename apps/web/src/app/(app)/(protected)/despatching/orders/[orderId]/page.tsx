"use client";

import Decimal from "decimal.js";

import { Datatable } from "@repo/ui/components/display";
import { TextLink } from "@repo/ui/components/typography";

import { component } from "@/models/component";
import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

export default function DespatchingPage({
  params,
}: {
  params: { orderId: string };
}) {
  const id = +params.orderId;

  return (
    <>
      <DatatableQueryProvider
        endpoint={api.despatching.order.items.list}
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
              <Datatable.Column id="componentDescription">
                Description
              </Datatable.Column>
              <Datatable.Column id="quantityOrdered">Ordered</Datatable.Column>
              <Datatable.Column id="quantityDespatched">
                Despatched
              </Datatable.Column>
              <Datatable.Column id="sageQuantityDespatched">
                Sage Despatched
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
                  <Datatable.Cell id="componentDescription">
                    {item.componentDescription}
                  </Datatable.Cell>
                  <Datatable.DecimalCell
                    id="quantityOrdered"
                    value={item.quantityOrdered}
                    unit={item.componentUnit}
                  />
                  <Datatable.DecimalCell
                    id="quantityDespatched"
                    value={item.quantityDespatched ?? new Decimal(0)}
                    unit={item.componentUnit}
                  />
                  <Datatable.DecimalCell
                    id="sageQuantityDespatched"
                    value={item.sageQuantityDespatched ?? new Decimal(0)}
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
