"use client";

import { component } from "@/models/component";
import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { TextLink } from "@repo/ui/components/typography";

export default function SubcomponentsPage({
  params,
}: {
  params: { componentId: string };
}) {
  const id = component.decodeURLId(params.componentId);

  return (
    <DatatableQueryProvider
      endpoint={api.component.subcomponent.list}
      defaultInput={{
        filter: {
          componentId: { eq: id },
        },
      }}
    >
      {(props) => (
        <Datatable {...props}>
          <Datatable.Head>
            <Datatable.Column id="subcomponentId" isSortable>
              Component
            </Datatable.Column>
            <Datatable.Column id="description" isSortable>
              Description
            </Datatable.Column>
            <Datatable.Column id="quantityRequired" isSortable>
              Quantity Required
            </Datatable.Column>
            <Datatable.Column id="freeQuantity" isSortable>
              Free Quantity
            </Datatable.Column>
            <Datatable.Column id="buildCapacity">
              Build Capacity
            </Datatable.Column>
          </Datatable.Head>
          <Datatable.Body data={props.data}>
            {({ data }) => (
              <Datatable.Row key={data.id}>
                <Datatable.Cell id="subcomponentId">
                  <TextLink
                    href={`/components/${component.encodeURLId(data.subcomponentId)}`}
                  >
                    {data.subcomponentId}
                  </TextLink>
                </Datatable.Cell>
                <Datatable.Cell id="description">
                  {data.description}
                </Datatable.Cell>
                <Datatable.DecimalCell
                  id="quantityRequired"
                  value={data.quantityRequired}
                  unit={data.unit}
                />
                <Datatable.DecimalCell
                  id="freeQuantity"
                  value={data.freeQuantity}
                  unit={data.unit}
                />
                <Datatable.DecimalCell
                  id="buildCapacity"
                  value={data.freeQuantity.div(data.quantityRequired).floor()}
                  unit={"Units"}
                  precision={0}
                />
              </Datatable.Row>
            )}
          </Datatable.Body>
        </Datatable>
      )}
    </DatatableQueryProvider>
  );
}
