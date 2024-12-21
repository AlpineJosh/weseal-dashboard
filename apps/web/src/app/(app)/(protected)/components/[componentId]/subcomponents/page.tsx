"use client";

import { component } from "@/models/component";
import { api } from "@/utils/trpc/react";

import { Datatable } from "@repo/ui/components/display";
import { TextLink } from "@repo/ui/components/typography";

export default function SubcomponentsPage({
  params,
}: {
  params: { componentId: string };
}) {
  const id = component.decodeURLId(params.componentId);

  const { data: subcomponents } = api.component.subcomponents.useQuery({
    componentId: id,
  });

  return (
    <Datatable>
      <Datatable.Head>
        <Datatable.Column id="subcomponentId">Component</Datatable.Column>
        <Datatable.Column id="description">Description</Datatable.Column>
        <Datatable.Column id="total">Quantity</Datatable.Column>
      </Datatable.Head>
      <Datatable.Body data={subcomponents}>
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
              {data.subcomponent.description}
            </Datatable.Cell>
            <Datatable.NumberCell
              id="total"
              value={data.quantity}
              unit={data.subcomponent.unit}
            />
          </Datatable.Row>
        )}
      </Datatable.Body>
    </Datatable>
  );
}
