import { useEffect, useState } from "react";
import { LocationPicker } from "@/components/LocationPicker";
import { api } from "@/utils/trpc/react";
import { useImmer } from "use-immer";
import { z } from "zod";

import type { RouterInputs, RouterOutputs } from "@repo/api";
import { Combobox, Input } from "@repo/ui/components/control";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";
import { AsyncData, DataQueryResponse } from "@repo/ui/lib/async";

type ProductionTaskFormProps = {
  onExit: () => void;
  onSave: () => void;
};

export const ProductionTaskForm = ({
  onExit,
  onSave,
}: ProductionTaskFormProps) => {
  const utils = api.useUtils();

  const [task, setTask] = useImmer<
    RouterInputs["inventory"]["tasks"]["create"]
  >({
    type: "production",
    assignedToId: "",
    items: [],
  });

  const [items, setItems] = useImmer<
    (RouterInputs["inventory"]["tasks"]["create"]["items"][number] & {
      componentId: string;
    })[]
  >([]);

  useEffect(() => {
    setTask((draft) => {
      draft.items = items.map((item) => {
        const { componentId, ...rest } = item;
        return { ...rest, putLocationId: values.putLocationId };
      });
    });
  }, [items]);

  const [values, setValues] = useImmer<{
    componentId: string | undefined;
    quantity: number;
    putLocationId: number | undefined;
  }>({
    componentId: undefined,
    quantity: 1,
    putLocationId: undefined,
  });

  const { data: subcomponents } = api.component.subcomponents.useQuery(
    {
      componentId: values.componentId as string,
    },
    { enabled: !!values.componentId },
  );

  const { mutate: createTask } = api.inventory.tasks.create.useMutation({
    onSuccess: () => {
      utils.inventory.tasks.list.invalidate();
    },
  });

  const save = () => {
    createTask(task);
    onExit();
  };

  return (
    <div className="flex flex-col gap-4 self-stretch">
      <h1 className="text-2xl font-semibold">Create Production Task</h1>
      <Form
        className="flex flex-row space-x-4"
        onSubmit={() => {
          console.log(values);
        }}
        schema={z.object({
          componentId: z.string(),
          locationId: z.string(),
          quantity: z.number(),
        })}
      >
        <>
          <Field name="component">
            <Field.Label>Component</Field.Label>
            <Field.Description>Select the component to build</Field.Description>

            <Combobox
              options={(query) => {
                return api.component.list.useQuery({
                  filter: {
                    hasSubcomponents: { eq: true },
                  },
                  search: { query },
                }) as AsyncData<
                  DataQueryResponse<
                    RouterOutputs["component"]["list"]["rows"][number]
                  >
                >;
              }}
              onSelectionChange={(componentId) => {
                setValues((draft) => {
                  draft.componentId = componentId as string;
                });
              }}
              selectedKey={values.componentId}
              keyAccessor="id"
            >
              {(component) => {
                return (
                  <Combobox.Option key={component.id} value={component}>
                    {component.id}
                  </Combobox.Option>
                );
              }}
            </Combobox>
          </Field>
          <Field name="quantity">
            <Field.Label>Quantity</Field.Label>
            <Field.Description>Amount to build</Field.Description>
            <Field.Control>
              <Input
                onChange={(e) => {
                  setValues((draft) => {
                    draft.quantity = Math.max(+e.target.value, 1);
                  });
                }}
                type="number"
                value={values.quantity}
              />
            </Field.Control>
          </Field>
          <Field name="location">
            <Field.Label>Production Location</Field.Label>
            <Field.Description>Component destination</Field.Description>
            <Field.Control>
              <Combobox
                options={(query) => {
                  return api.inventory.locations.list.useQuery({
                    search: { query },
                  }) as AsyncData<
                    DataQueryResponse<
                      RouterOutputs["inventory"]["locations"]["list"]["rows"][number]
                    >
                  >;
                }}
                onSelectionChange={(locationId) => {
                  setValues((draft) => {
                    draft.putLocationId = locationId as number;
                  });
                }}
                selectedKey={values.putLocationId}
                keyAccessor="id"
              >
                {(location) => {
                  return (
                    <Combobox.Option
                      key={location.id}
                      textValue={location.name ?? ""}
                      value={location}
                    >
                      {location.name} - {location.groupName}
                    </Combobox.Option>
                  );
                }}
              </Combobox>
            </Field.Control>
          </Field>
          <Field name="batchReference">
            <Field.Label>Batch Reference</Field.Label>
            <Field.Description>Input the batch reference</Field.Description>
            <Field.Control>
              <Input type="text" />
            </Field.Control>
          </Field>
        </>
      </Form>
      <div className="width-full flex max-h-[400px] flex-col overflow-y-auto">
        {values.componentId ? (
          <LocationPicker
            components={
              subcomponents?.map((subcomponent) => {
                return {
                  id: subcomponent.subcomponentId,
                  quantity: subcomponent.quantity * values.quantity,
                };
              }) ?? []
            }
            value={items}
            onChange={(items) => {
              setItems(items);
            }}
          />
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center">
            <span className="text-muted-foreground">
              Please select a component
            </span>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="plain" color="default" onPress={onExit}>
          Cancel
        </Button>
        <Button
          isDisabled={!values.componentId}
          variant="solid"
          color="primary"
          onPress={() => {
            save();
            close();
          }}
        >
          Create Task
        </Button>
      </div>
    </div>
  );
};
