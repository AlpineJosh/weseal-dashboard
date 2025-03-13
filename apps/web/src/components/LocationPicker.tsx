import { useEffect, useMemo } from "react";
import { api } from "@/utils/trpc/react";
import { Decimal } from "decimal.js";
import { useImmer } from "use-immer";

import type { RouterOutputs } from "@repo/api";
import { faHashtag, faShelves } from "@repo/pro-light-svg-icons";
import { cn } from "@repo/ui";
import { NumberInput, Switch } from "@repo/ui/components/control";
import { Icon } from "@repo/ui/components/element";
import { Heading, Strong, Text } from "@repo/ui/components/typography";

interface TaskItem {
  componentId: string;
  locationId: number;
  batchId?: number;
  quantity: Decimal;
}

export interface LocationPickerItemProps {
  id: string;
  quantity: Decimal;
  value: TaskItem[];
  onChange: (items: TaskItem[]) => void;
}

export interface LocationPickerProps {
  components: {
    id: string;
    quantity: Decimal;
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

type InventoryType = NonNullable<
  RouterOutputs["inventory"]["list"]["rows"][number]
> & {
  blocked: boolean;
  using: Decimal;
  overridden: boolean;
};

const LocationPickerItem = ({
  id,
  quantity: defaultQuantity,
  value,
  onChange,
}: LocationPickerItemProps) => {
  const [initialQuantity, setInitialQuantity] =
    useImmer<Decimal>(defaultQuantity);
  const [quantity, setQuantity] = useImmer<Decimal>(initialQuantity);
  const [inventory, setInventory] = useImmer<InventoryType[]>([]);
  console.log(quantity.toString());

  const { data: component } = api.component.get.useQuery({
    id,
  });

  const totalAvailable = useMemo(() => {
    return inventory.reduce(
      (acc, location) => location.freeQuantity.add(acc),
      new Decimal(0),
    );
  }, [inventory]);

  const { data: quantities } = api.inventory.list.useQuery({
    filter: {
      componentId: {
        eq: id,
      },
      freeQuantity: {
        gt: 0,
        null: false,
      },
    },
    sort: [
      {
        field: "entryDate",
        order: "asc",
      },
    ],
    pagination: {
      page: 1,
      size: 100,
    },
  });

  useEffect(() => {
    if (quantities) {
      const locs = [];
      for (const quantity of quantities.rows) {
        locs.push({
          ...quantity,
          blocked: false,
          using: new Decimal(0),
          overridden: false,
        });
      }
      setInventory(locs);
    }
  }, [quantities, setInventory]);

  useEffect(() => {
    if (!defaultQuantity.eq(initialQuantity)) {
      setInitialQuantity(defaultQuantity);
    }
  }, [defaultQuantity, initialQuantity, setInitialQuantity]);

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity, setQuantity]);

  useEffect(() => {
    const batches = [];
    let remaining = quantity;

    for (const location of inventory) {
      if (location.overridden && !location.blocked && location.using.gt(0)) {
        batches.push({
          locationId: location.locationId,
          batchId: location.batchId,
          quantity: location.using,
          componentId: id,
        });
        remaining = remaining.sub(location.using);
      }
    }

    if (remaining.gt(0)) {
      for (const location of inventory) {
        if (!location.blocked && !location.overridden && remaining.gt(0)) {
          const use = Decimal.min(location.freeQuantity, remaining);
          if (use.gt(0)) {
            remaining = remaining.sub(use);
            batches.push({
              locationId: location.locationId,
              batchId: location.batchId,
              quantity: use,
              componentId: id,
            });
          }
        }
      }
    }

    const hasChanges =
      batches.length !== value.length ||
      batches.some((newBatch) => {
        const existingBatch = value.find(
          (batch) =>
            batch.locationId === newBatch.locationId &&
            batch.batchId === newBatch.batchId,
        );
        return !existingBatch?.quantity.eq(newBatch.quantity);
      });

    if (hasChanges) {
      onChange(batches);
    }
  }, [inventory, quantity, id, onChange, value]);

  const getUsing = (inventory: InventoryType) => {
    const existing = value.find(
      (batch) =>
        batch.locationId === inventory.locationId &&
        batch.batchId === inventory.batchId,
    );
    return existing?.quantity ?? new Decimal(0);
  };

  const updateUsing = (inventory: InventoryType, quantity: Decimal) => {
    setInventory((draft) => {
      const loc = draft.find(
        (l) =>
          l.locationId === inventory.locationId &&
          l.batchId === inventory.batchId,
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
        <Text className={cn(totalAvailable.lt(quantity) && "text-destructive")}>
          Available:{" "}
          <Strong
            className={cn(totalAvailable.lt(quantity) && "text-destructive")}
          >
            {totalAvailable.toFixed(6)}
          </Strong>
        </Text>
        <span className="flex flex-row items-baseline space-x-2">
          <Text>Required:</Text>
          <NumberInput
            className="w-24"
            value={quantity}
            onChange={(value) => setQuantity(value)}
          />
        </span>
      </div>
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_2fr] items-center gap-4">
        {inventory.map((inventory, index) => (
          <>
            <Switch
              key={index}
              isSelected={!inventory.blocked}
              onChange={() => {
                setInventory((draft) => {
                  const loc = draft[index];
                  if (loc) {
                    loc.blocked = !loc.blocked;
                    loc.overridden = false;
                    loc.using = new Decimal(0);
                  }
                });
              }}
            />
            <span className="flex flex-row items-center space-x-2 text-content-muted">
              <Icon icon={faShelves} />
              <Text>{inventory.locationName}</Text>
            </span>
            <span className="flex flex-row items-center space-x-2 text-content-muted">
              <Icon icon={faHashtag} />
              <Text>{inventory.batchReference}</Text>
            </span>
            <Text>
              Available: <Strong>{inventory.freeQuantity.toFixed(6)}</Strong>
            </Text>
            <span className="flex flex-row items-center justify-end space-x-2 text-content-muted">
              <Text>Using:</Text>
              <NumberInput
                className="flex-1"
                value={getUsing(inventory)}
                onChange={(value) => {
                  updateUsing(inventory, value);
                }}
              />
            </span>
          </>
        ))}
      </div>
    </div>
  );
};
