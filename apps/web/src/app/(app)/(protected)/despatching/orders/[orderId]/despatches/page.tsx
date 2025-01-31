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
        endpoint={api.despatching.despatch.list}
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
              <Datatable.Column id="id">Despatch ID</Datatable.Column>
              <Datatable.Column id="despatchDate">
                Despatch Date
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data: despatch }) => (
                <Datatable.Row key={despatch.id}>
                  <Datatable.Cell id="id">
                    <TextLink href={`/receiving/despatch/${despatch.id}`}>
                      {despatch.id}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="despatchDate">
                    {item.despatchDate?.toLocaleDateString()}
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
