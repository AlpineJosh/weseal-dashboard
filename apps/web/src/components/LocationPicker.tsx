import { Suspense, useEffect } from "react";
import { api } from "@/utils/trpc/react";
import { useImmer } from "use-immer";

import type { RouterOutputs } from "@repo/api";
import { Table } from "@repo/ui/components/display";

type TaskItem = {
  componentId: string;
  locationId: number;
  batchId: number;
  quantity: number;
};

export interface LocationPickerItemProps {
  id: string;
  quantity: number;
  value: TaskItem[];
  onChange: (items: TaskItem[]) => void;
}

export interface LocationPickerProps {
  components: {
    id: string;
    quantity: number;
  }[];
  value: TaskItem[];
  onChange: (items: TaskItem[]) => void;
}

export const LocationPicker = ({
  components,
  value,
  onChange,
}: LocationPickerProps) => {
  return (
    <div>
      {components.map((component) => (
        <LocationPickerItem
          key={component.id}
          id={component.id}
          quantity={component.quantity}
          value={value.filter((item) => item.componentId === component.id)}
          onChange={(items) => {
            const updated = value.filter(
              (item) => item.componentId !== component.id,
            );
            updated.push(
              ...items.map((item) => ({ ...item, componentId: component.id })),
            );
            onChange(updated);
          }}
        />
      ))}
    </div>
  );
};

type LocationsType = NonNullable<
  RouterOutputs["component"]["get"]
>["locations"][number] & {
  blocked: boolean;
  using: number;
};

const LocationPickerItem = ({
  id,
  quantity,
  value,
  onChange,
}: LocationPickerItemProps) => {
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
          blocked: false,
          using: 0,
        });
      }
      setLocations(locs);
      calculateQuantities();
    }
  }, [component, setLocations]);

  const calculateQuantities = () => {
    const batches = [];
    let remaining = quantity;
    for (let ii = 0; ii < locations.length; ii++) {
      const location = locations[ii]!;

      if (!location.blocked && remaining > 0) {
        const use = Math.min(location.total, remaining);
        remaining -= use;
        batches.push({
          locationId: location.location.id,
          batchId: location.batch.id,
          quantity: use,
        });
      }
    }
    onChange(batches.map((batch) => ({ ...batch, componentId: id })));
    return remaining;
  };

  useEffect(() => {
    calculateQuantities();
  }, [locations, quantity]);

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
            {locations.map((location, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <input
                    type="checkbox"
                    checked={!location.blocked}
                    onChange={() => {
                      setLocations((draft) => {
                        draft![index]!.blocked = !draft![index]!.blocked;
                      });
                    }}
                  />
                </Table.Cell>
                <Table.Cell>{location.location.name}</Table.Cell>
                <Table.Cell>{location.batch.batchReference}</Table.Cell>
                <Table.Cell>
                  {value.find(
                    (batch) =>
                      batch.locationId === location.location.id &&
                      batch.batchId === location.batch.id,
                  )?.quantity ?? 0}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </Suspense>
  );
};
