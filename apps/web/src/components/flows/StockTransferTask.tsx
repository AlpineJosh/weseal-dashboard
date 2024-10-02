import { api } from "@/utils/trpc/react";
import { useImmer } from "use-immer";
import { z } from "zod";

import type { RouterOutputs } from "@repo/api";
import { Combobox, Input, Select } from "@repo/ui/components/control";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

export function StockTransferTaskForm({
  onSave,
  onExit,
}: {
  onSave: () => void;
  onExit: () => void;
}) {
  const [values, setValues] = useImmer<{
    componentId: string | undefined;
    pickLocationId: string | undefined;
    putLocationId: string | undefined;
    quantity: number;
  }>({
    componentId: undefined,
    pickLocationId: undefined,
    putLocationId: undefined,
    quantity: 1,
  });

  return (
    <div className="flex flex-col gap-4 self-stretch">
      <h1 className="text-2xl font-semibold">Create Transfer Task</h1>
      <Form
        className="flex flex-col space-y-4"
        onSubmit={() => {
          onSave();
        }}
        schema={z.any()}
      >
        <Field name="component">
          <Field.Label>Component</Field.Label>
          <Field.Description>Select the component to build</Field.Description>
          <Field.Control>
            <Combobox<RouterOutputs["component"]["list"]["rows"][number]>
              keyAccessor="id"
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
        <Field name="pickLocation">
          <Field.Label>Pick Location</Field.Label>
          <Field.Description>
            Select the location to pick from
          </Field.Description>
          <Field.Control>
            <Combobox<RouterOutputs["inventory"]["locations"]["rows"][number]>
              options={(query) => {
                return api.inventory.locations.useQuery({
                  filter: {
                    search: query,
                  },
                });
              }}
              onSelectionChange={(locationId) => {
                setValues((draft) => {
                  draft.pickLocationId = locationId as string;
                });
              }}
              keyAccessor="id"
            >
              {(location) => {
                return (
                  <Combobox.Option
                    key={location.id}
                    value={location}
                    textValue={location.name}
                  >
                    {location.name} - {location.group.name}
                  </Combobox.Option>
                );
              }}
            </Combobox>
          </Field.Control>
        </Field>
        <Field name="quantity">
          <Field.Label>Quantity</Field.Label>
          <Field.Description>Amount to move</Field.Description>
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
        <Field name="putLocation">
          <Field.Label>Put Location</Field.Label>
          <Field.Description>Select destination location</Field.Description>
          <Field.Control>
            <Field.Control>
              <Combobox<RouterOutputs["inventory"]["locations"]["rows"][number]>
                options={(query) => {
                  return api.inventory.locations.useQuery({
                    filter: {
                      search: query,
                    },
                  });
                }}
                onSelectionChange={(locationId) => {
                  setValues((draft) => {
                    draft.putLocationId = locationId as string;
                  });
                }}
                keyAccessor="id"
              >
                {(location) => {
                  return (
                    <Combobox.Option
                      key={location.id}
                      value={location}
                      textValue={location.name}
                    >
                      {location.name} - {location.group.name}
                    </Combobox.Option>
                  );
                }}
              </Combobox>
            </Field.Control>
          </Field.Control>
        </Field>
        <Button color="primary" type="submit">
          Create Task
        </Button>
      </Form>
    </div>
  );
}
