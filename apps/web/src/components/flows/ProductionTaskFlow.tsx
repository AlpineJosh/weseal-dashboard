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
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";
import { Card } from "@repo/ui/components/layout";
import { Flow } from "@repo/ui/components/navigation";

// const SearchableListbox: React.FC<any> = (props) => {
//   return <div>Placeholder</div>;
// };

export function ProductionTaskForm({ close }: { close: () => void }) {
  const [query, setQuery] = useState<string>("");

  const [values, setValues] = useState<any>({
    component: "",
    quantity: 1,
    location: "",
  });

  const { data: components } = api.component.list.useQuery({
    filter: {
      hasSubcomponents: true,
      search: query,
    },
  });

  const { data: locations } = api.inventory.locations.useQuery();
  return (
    <div className="flex w-[800px] max-w-screen-md flex-col gap-4 self-stretch p-8">
      <h1 className="text-2xl font-semibold">Create Production Task</h1>
      <Form
        className="space-y-4"
        onSubmit={() => {
          console.log(values);
        }}
        schema={z.object({
          component: z.string(),
          location: z.string(),
          quantity: z.number(),
        })}
      >
        <>
          <Field name="component">
            <Field.Label>Component</Field.Label>
            <Field.Description>Select the component to build</Field.Description>
            <Field.Control>
              <Combobox
                onInputChange={(query) => {
                  console.log(query);
                  setQuery(query);
                }}
                options={components?.rows ?? []}
                onSelectionChange={(componentId) => {
                  const component = components?.rows.find(
                    (component) => component.id === componentId,
                  );
                  setValues({ ...values, component });
                }}
              >
                {(
                  component: RouterOutputs["component"]["list"]["rows"][number],
                ) => {
                  return (
                    <Combobox.Option value={component}>
                      {component.id}
                    </Combobox.Option>
                  );
                }}
              </Combobox>
            </Field.Control>
          </Field>
          <Field name="quantity">
            <Field.Label>Quantity</Field.Label>
            <Field.Control>
              <Input
                onChange={(e) => {
                  setValues({
                    ...values,
                    quantity: Math.max(+e.target.value, 1),
                  });
                }}
                type="number"
              />
            </Field.Control>
          </Field>
          <Field name="location">
            <Field.Label>Destination</Field.Label>
            <Field.Control>
              <Field.Control>
                <Combobox options={locations ?? []}>
                  {(
                    location: RouterOutputs["inventory"]["locations"][number],
                  ) => {
                    return (
                      <Combobox.Option value={location}>
                        {location.name}
                      </Combobox.Option>
                    );
                  }}
                </Combobox>
              </Field.Control>
            </Field.Control>
          </Field>
        </>
      </Form>
      {values.component && (
        <LocationPicker
          components={values.component.subcomponents.map(
            (subcomponent: any) => ({
              id: subcomponent.subcomponentId,
              quantity: subcomponent.quantity * values.quantity,
            }),
          )}
        />
      )}
      <Button
        variant="primary"
        onPress={() => {
          close();
        }}
      >
        Save
      </Button>
    </div>
  );
}
