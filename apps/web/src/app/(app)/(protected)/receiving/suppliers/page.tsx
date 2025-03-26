"use client";

import { Datatable } from "@repo/ui/components/display";
import { Heading, TextLink } from "@repo/ui/components/typography";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

export default function SuppliersOverview() {
  return (
    <div className="flex h-[calc(100vh-10rem)] max-h-full grow flex-col gap-4">
      <Heading level={1}>Suppliers</Heading>

      <DatatableQueryProvider
        endpoint={api.receiving.supplier.list}
        defaultInput={{
          sort: [{ field: "openOrderCount", order: "desc" }],
        }}
      >
        {(props) => (
          <Datatable className="grow overflow-hidden" {...props}>
            <Datatable.Head>
              <Datatable.Column id="id" isSortable>
                ID
              </Datatable.Column>
              <Datatable.Column id="name" isSortable>
                Name
              </Datatable.Column>
              <Datatable.Column id="orderCount" isSortable>
                Total Orders
              </Datatable.Column>
              <Datatable.Column id="openOrderCount" isSortable>
                Open Orders
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={`${data.id}`}>
                  <Datatable.Cell id="id">
                    <TextLink href={`/receiving/suppliers/${data.id}`}>
                      {data.id}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="name">
                    <TextLink href={`/receiving/suppliers/${data.id}`}>
                      {data.name}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="orderCount">
                    {data.orderCount}
                  </Datatable.Cell>
                  <Datatable.Cell id="openOrderCount">
                    {data.openOrderCount}
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
