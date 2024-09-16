import { Suspense, useEffect } from "react";
import { api } from "@/utils/trpc/react";
import { useImmer } from "use-immer";

import type { RouterOutputs } from "@repo/api";
import { Table } from "@repo/ui/components/display";

export interface LocationPickerProps {
  components: {
    id: string;
    quantity: number;
  }[];
}

export const LocationPicker = ({ components }: LocationPickerProps) => {
  return (
    <div>
      {components.map((component) => (
        <LocationPickerItem
          key={component.id}
          id={component.id}
          quantity={component.quantity}
        />
      ))}
    </div>
  );
};

type LocationsType = NonNullable<
  RouterOutputs["component"]["get"]
>["locations"][number] & {
  _blocked: boolean;
  _using: number;
};

const LocationPickerItem = ({
  id,
  quantity,
}: {
  id: string;
  quantity: number;
}) => {
  const [locations, setLocations] = useImmer<LocationsType[]>([]);

  const [component] = api.component.get.useSuspenseQuery({
    id,
  });

  useEffect(() => {
    if (component) {
      const locs = [];
      for (const location of component.locations) {
        locs.push({
          ...location,
          _blocked: false,
          _using: 0,
        });
      }
      setLocations(locs);
    }
  }, [component, setLocations]);

  if (!component) return null;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-row border-b">
        <div className="flex w-1/3 shrink-0 flex-col border-r p-2">
          <span className="font-semibold">{component.id}</span>
          <span className="text-sm text-muted-foreground">
            {component.description}
          </span>
          <span className="text-lg">{quantity}</span>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head />
              <Table.Head>Location</Table.Head>
              <Table.Head>Batch</Table.Head>
              <Table.Head>Quantity</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {component.locations.map((location, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <input type="checkbox" checked={true} onChange={() => {}} />
                </Table.Cell>
                <Table.Cell>{location.location.name}</Table.Cell>
                <Table.Cell>{location.batch.batchReference}</Table.Cell>
                <Table.Cell>{location.total}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </Suspense>
  );
};
