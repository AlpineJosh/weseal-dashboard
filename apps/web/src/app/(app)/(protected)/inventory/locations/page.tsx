"use client";

import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";
import { useImmer } from "use-immer";

import { Datatable } from "@repo/ui/components/display";
import { Badge } from "@repo/ui/components/element";
import { Heading, TextLink } from "@repo/ui/components/typography";

const colors: Color[] = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
];

type Color =
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal";

export default function LocationOverview() {
  const [typeColor, setTypeColor] = useImmer<Record<number, Color>>({});
  const getBadgeColor = (typeId: number): Color => {
    if (typeColor[typeId]) return typeColor[typeId];

    const color = colors[typeId % colors.length] ?? "green";
    setTypeColor((draft) => {
      draft[typeId] = color;
    });
    return color;
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] max-h-full grow flex-col gap-4">
      <Heading level={1}>Locations</Heading>

      <DatatableQueryProvider endpoint={api.location.list} defaultInput={{}}>
        {(props) => (
          <Datatable className="grow overflow-hidden" {...props}>
            <Datatable.Head>
              <Datatable.Column id="name" isSortable>
                Name
              </Datatable.Column>
              <Datatable.Column id="details" isSortable>
                Description
              </Datatable.Column>
              <Datatable.Column id="groupName" isSortable>
                Group
              </Datatable.Column>
              <Datatable.Column id="typeName" isSortable>
                Type
              </Datatable.Column>
              <Datatable.Column id="isPickable" isSortable>
                Pickable
              </Datatable.Column>
              <Datatable.Column id="isTransient" isSortable>
                Transient
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={`${data.id}`}>
                  <Datatable.Cell id="name">
                    <TextLink href={`/inventory/locations/${data.id}`}>
                      {data.name}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="details">{data.details}</Datatable.Cell>
                  <Datatable.Cell id="groupName">
                    {data.groupName}
                  </Datatable.Cell>
                  <Datatable.Cell id="typeName">
                    <Badge color={getBadgeColor(data.typeId)}>
                      {data.typeName}
                    </Badge>
                  </Datatable.Cell>
                  <Datatable.Cell id="isPickable">
                    {data.isPickable ? "Yes" : "No"}
                  </Datatable.Cell>
                  <Datatable.Cell id="isTransient">
                    {data.isTransient ? "Yes" : "No"}
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
