import { Suspense, useEffect } from "react";
import { api } from "@/utils/trpc/react";
import { useImmer } from "use-immer";

import type { RouterInputs, RouterOutputs } from "@repo/api";
import { Table } from "@repo/ui/components/display";

type TaskItem =
  RouterInputs["inventory"]["tasks"]["create"]["items"][number] & {
    componentId: string;
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
  const handleItemChange = (items: TaskItem[], componentId: string) => {
    const updated = value.filter((item) => item.componentId !== componentId);
    updated.push(...items);

    onChange(updated);
  };

  return (
    <div>
      {components.map((component) => (
        <LocationPickerItem
          key={component.id}
          id={component.id}
          quantity={component.quantity}
          value={value.filter((item) => item.componentId === component.id)}
          onChange={(items) => handleItemChange(items, component.id)}
        />
      ))}
    </div>
  );
};

type LocationsType = NonNullable<
  RouterOutputs["inventory"]["quantity"]["rows"][number]
> & {
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

  const { data: component } = api.component.get.useQuery({
    id,
  });

  const { data: quantities } = api.inventory.quantity.useQuery({
    filter: {
      componentId: {
        eq: id,
      },
      free: {
        gt: 0,
      },
    },
  });

  useEffect(() => {
    if (quantities) {
      const locs = [];
      for (const quantity of quantities.rows) {
        locs.push({
          ...quantity,
          blocked: false,
          using: 0,
        });
      }
      setLocations(locs);
    }
  }, [quantities]);

  const calculateQuantities = () => {
    const batches = [];
    let remaining = quantity;

    for (let ii = 0; ii < locations.length; ii++) {
      const location = locations[ii]!;

      if (!location.blocked && remaining > 0) {
        const use = Math.min(location.total, remaining);
        remaining -= use;
        batches.push({
          pickLocationId: location.locationId,
          batchId: location.batchId,
          quantity: use,
          componentId: id,
        });
      }
    }
    return batches.map((batch) => ({ ...batch, componentId: id }));
  };

  useEffect(() => {
    const newBatches = calculateQuantities();
    const hasChanges = newBatches.some((newBatch) => {
      const existingBatch = value.find(
        (batch) =>
          batch.pickLocationId === newBatch.pickLocationId &&
          batch.batchId === newBatch.batchId,
      );
      return !existingBatch || existingBatch.quantity !== newBatch.quantity;
    });

    if (hasChanges) {
      onChange(newBatches);
    }
  }, [locations, quantity, onChange]);

  if (!component) return null;

  return (
    <div className="relative flex flex-row border-b">
      <div className="flex w-1/3 shrink-0 flex-col border-r p-2">
        <span className="font-semibold">{component.id}</span>
        <span className="text-muted-foreground text-sm">
          {component.description}
        </span>
        <span className="text-lg">{quantity}</span>
      </div>
      <Table>
        <Table.Header>
          <Table.Column />
          <Table.Column isRowHeader>Location</Table.Column>
          <Table.Column>Batch</Table.Column>
          <Table.Column>Quantity</Table.Column>
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
              <Table.Cell>{location.locationName}</Table.Cell>
              <Table.Cell>
                {location.batchReference ||
                  (location.batchEntryDate
                    ? location.batchEntryDate.toLocaleDateString()
                    : "")}
              </Table.Cell>
              <Table.Cell>
                {value.find(
                  (batch) =>
                    batch.pickLocationId === location.locationId &&
                    batch.batchId === location.batchId,
                )?.quantity ?? 0}{" "}
                / {location.total}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};
