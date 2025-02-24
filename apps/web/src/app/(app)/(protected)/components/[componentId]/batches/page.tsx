"use client";

import { batch } from "@/models/batch";
import { component } from "@/models/component";
import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";

export default function BatchesPage({
  params,
}: {
  params: { componentId: string };
}) {
  const id = component.decodeURLId(params.componentId);

  return (
    <DatatableQueryProvider
      endpoint={api.batch.list}
      defaultInput={{
        filter: {
          componentId: { eq: id },
          totalQuantity: { neq: 0 },
        },
      }}
    >
      {(props) => (
        <Datatable {...props}>
          <Datatable.Head>
            <Datatable.Column id="batchReference" isSortable>
              Batch
            </Datatable.Column>
            <Datatable.Column id="totalQuantity" isSortable>
              Quantity
            </Datatable.Column>
          </Datatable.Head>
          <Datatable.Body data={props.data}>
            {({ data }) => (
              <Datatable.Row key={`${data.id}`}>
                <Datatable.Cell id="batchReference">
                  {batch.getDisplayId(data.batchReference, data.entryDate)}
                </Datatable.Cell>
                <Datatable.DecimalCell
                  id="totalQuantity"
                  value={data.totalQuantity}
                  unit={data.componentUnit}
                />
              </Datatable.Row>
            )}
          </Datatable.Body>
        </Datatable>
      )}
    </DatatableQueryProvider>
  );
}
