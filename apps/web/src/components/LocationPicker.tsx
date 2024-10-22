import { useEffect, useMemo } from "react";
import { api } from "@/utils/trpc/react";
import { useImmer } from "use-immer";

import type { RouterInputs, RouterOutputs } from "@repo/api";
import { faBox, faHashtag, faShelves } from "@repo/pro-light-svg-icons";
import { cn } from "@repo/ui";
import { Input, Switch } from "@repo/ui/components/control";
import { Table } from "@repo/ui/components/display";
import { Icon } from "@repo/ui/components/element";
import { Heading, Strong, Text } from "@repo/ui/components/typography";

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
    <div className="space-y-4">
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
  overridden: boolean;
};

const LocationPickerItem = ({
  id,
  quantity: defaultQuantity,
  value,
  onChange,
}: LocationPickerItemProps) => {
  const [quantity, setQuantity] = useImmer(defaultQuantity);
  const [locations, setLocations] = useImmer<LocationsType[]>([]);

  const { data: component } = api.component.get.useQuery({
    id,
  });
  const totalUsing = useMemo(() => {
    return value.reduce((acc, item) => acc + item.quantity, 0);
  }, [value]);
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
          overridden: false,
        });
      }
      setLocations(locs);
    }
  }, [quantities, setLocations]);

  useEffect(() => {
    setQuantity(defaultQuantity);
  }, [defaultQuantity, setQuantity]);

  useEffect(() => {
    const batches = [];
    let remaining = quantity;

    for (const location of locations) {
      if (location.overridden) {
        if (location.blocked) {
          continue;
        }
        remaining -= location.using;
        batches.push({
          pickLocationId: location.locationId,
          batchId: location.batchId,
          quantity: location.using,
          componentId: id,
        });
      }
    }

    for (const location of locations) {
      if (!location.blocked && !location.overridden && remaining > 0) {
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

    const hasChanges =
      batches.length !== value.length ||
      batches.some((newBatch) => {
        const existingBatch = value.find(
          (batch) =>
            batch.pickLocationId === newBatch.pickLocationId &&
            batch.batchId === newBatch.batchId,
        );
        return !existingBatch || existingBatch.quantity !== newBatch.quantity;
      });

    if (hasChanges) {
      onChange(batches);
    }
  }, [locations, quantity, onChange, value, id]);

  const getUsing = (location: LocationsType) => {
    const existing = value.find(
      (batch) =>
        batch.pickLocationId === location.locationId &&
        batch.batchId === location.batchId,
    );
    return existing?.quantity ?? 0;
  };

  const updateUsing = (location: LocationsType, quantity: number) => {
    setLocations((draft) => {
      const loc = draft.find(
        (l) =>
          l.locationId === location.locationId &&
          l.batchId === location.batchId,
      );
      if (loc) {
        loc.using = quantity;
        loc.overridden = true;
      }
    });
  };

  if (!component) return null;

  return (
    <div className="flex flex-col space-y-2 border-b border-content/15 py-2">
      <div className="flex flex-row items-baseline space-x-4">
        <Heading level={5} className="text-lg">
          {component.id}
        </Heading>
        <Text className="text-muted-foreground grow truncate text-sm">
          {component.description}
        </Text>
        <Text className={cn(totalUsing !== quantity && "text-destructive")}>
          Using:{" "}
          <Strong
            className={cn(totalUsing !== quantity && "text-destructive-text")}
          >
            {totalUsing}
          </Strong>
        </Text>
        <span className="flex flex-row items-baseline space-x-2">
          <Text>Required:</Text>
          <Input
            type="number"
            step="any"
            className="w-24"
            value={quantity}
            min={0}
            onChange={(e) => setQuantity(e.target.valueAsNumber)}
          />
        </span>
      </div>
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] items-center gap-4">
        {locations.map((location, index) => (
          <>
            <Switch
              key={index}
              isSelected={!location.blocked}
              onChange={() => {
                setLocations((draft) => {
                  const loc = draft[index];
                  if (loc) {
                    loc.blocked = !loc.blocked;
                    loc.overridden = false;
                    loc.using = 0;
                  }
                });
              }}
            />
            <span className="flex flex-row items-center space-x-2 text-content-muted">
              <Icon icon={faShelves} />
              <Text>{location.locationName}</Text>
            </span>
            <span className="flex flex-row items-center space-x-2 text-content-muted">
              <Icon icon={faHashtag} />
              <Text>
                {location.batchReference ??
                  (location.batchEntryDate
                    ? location.batchEntryDate.toLocaleDateString()
                    : "")}
              </Text>
            </span>
            <Text>
              Available: <Strong>{location.free}</Strong>
            </Text>
            <span className="flex flex-row items-center justify-end space-x-2 text-content-muted">
              <Text>Using:</Text>
              <Input
                type="number"
                step="any"
                className="w-24"
                min={0}
                max={location.free}
                value={getUsing(location)}
                onChange={(e) => {
                  updateUsing(location, e.target.valueAsNumber);
                }}
              />
            </span>
          </>
        ))}
      </div>
    </div>
  );
};
