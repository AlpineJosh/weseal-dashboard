"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { Heading, TextLink } from "@repo/ui/components/typography";

export default function CustomersOverview() {
  return (
    <div className="flex h-[calc(100vh-10rem)] max-h-full grow flex-col gap-4">
      <Heading level={1}>Customers</Heading>

      <DatatableQueryProvider
        endpoint={api.despatching.customer.list}
        defaultInput={{
          sort: [{ field: "name", order: "asc" }],
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
              <Datatable.Column id="openOrders" isSortable>
                Open Orders
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={`${data.id}`}>
                  <Datatable.Cell id="id">
                    <TextLink href={`/despatching/customers/${data.id}`}>
                      {data.id}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="name">
                    <TextLink href={`/despatching/customers/${data.id}`}>
                      {data.name}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="openOrders">
                    {data.openOrders}
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
