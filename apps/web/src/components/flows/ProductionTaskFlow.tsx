"use client";

import { useState } from "react";
import { LocationPicker } from "@/components/LocationPicker";
import { SearchableListbox } from "@/components/SearchableListbox";
import { api } from "@/utils/trpc/react";
import { useImmer } from "use-immer";
import { z } from "zod";

import type { RouterInputs, RouterOutputs } from "@repo/api";
import type { FlowStepRendererProps } from "@repo/ui/components/navigation";
import { Combobox, Input, Select } from "@repo/ui/components/control";
import { Table } from "@repo/ui/components/display";
import { Badge, Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";
import { Card } from "@repo/ui/components/layout";
import { Flow } from "@repo/ui/components/navigation";

export function ProductionTaskForm() {
  const [query, setQuery] = useState<string>("");

  const [values, setValues] = useImmer<{
    componentId: string | undefined;
    quantity: number;
    locationId: string | undefined;
  }>({
    componentId: undefined,
    quantity: 1,
    locationId: undefined,
  });

  const { data: subcomponents } = api.component.subcomponents.useQuery(
    {
      componentId: values.componentId as string,
    },
    { enabled: !!values.componentId },
  );

  const [items, setItems] = useImmer<
    {
      componentId: string;
      locationId: number;
      batchId: number;
      quantity: number;
    }[]
  >([]);

  const { mutate: createTask } = api.task.create.useMutation();
  const save = () => {
    createTask({
      type: "production",
      assignedToId: "1",
      items: items.map((item) => ({
        ...item,
        locationId: item.locationId as number,
      })),
    });
  };

  return (
    <div className="flex w-[800px] max-w-screen-md flex-col gap-4 self-stretch p-8">
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
            <Field.Control>
              <Combobox<RouterOutputs["component"]["list"]["rows"][number]>
                options={(query) => {
                  return api.component.list.useQuery({
                    filter: {
                      hasSubcomponents: true,
                      search: query,
                    },
                  });
                }}
                onSelectionChange={(componentId) => {
                  setValues((draft) => {
                    draft.componentId = componentId as string;
                  });
                }}
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
            </Field.Control>
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
            <Field.Description>
              Where the components need to go
            </Field.Description>
            <Field.Control>
              <Field.Control>
                <Combobox<
                  RouterOutputs["inventory"]["locations"]["rows"][number]
                >
                  options={(query) => {
                    return api.inventory.locations.useQuery({
                      filter: {
                        search: query,
                      },
                    });
                  }}
                  keyAccessor="id"
                >
                  {(location) => {
                    return (
                      <Combobox.Option
                        key={location.id}
                        textValue={location.name}
                        value={location}
                      >
                        {location.name} - {location.group.name}
                      </Combobox.Option>
                    );
                  }}
                </Combobox>
              </Field.Control>
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
            onChange={setItems}
          />
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center">
            <span className="text-muted-foreground">
              Please select a component
            </span>
          </div>
        )}
      </div>
      <Button
        variant="primary"
        isDisabled={!values.componentId}
        onPress={() => {
          save();
        }}
      >
        Save
      </Button>
    </div>
  );
}
