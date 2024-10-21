import { api } from "@/utils/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AsyncCombobox } from "node_modules/@repo/ui/src/components/control/combobox/combobox.component";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Combobox, Input } from "@repo/ui/components/control";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

const taskSchema = z.object({
  componentId: z.string(),
  batchId: z.number(),
  pickLocationId: z.number(),
  putLocationId: z.number(),
  assignedToId: z.string(),
  quantity: z.number().min(0),
});

export function StockTransferTaskForm({
  onSave,
  // onExit,
}: {
  onSave: () => void;
  onExit: () => void;
}) {
  const utils = api.useUtils();
  const form = useForm<z.infer<typeof taskSchema>>({
    defaultValues: {
      quantity: 1,
      assignedToId: undefined,
      batchId: undefined,
      pickLocationId: undefined,
      putLocationId: undefined,
      componentId: undefined,
    },
    resolver: zodResolver(taskSchema),
  });
  const componentId = form.watch("componentId");

  const { mutate: createTask } = api.inventory.tasks.create.useMutation({
    onSuccess: async () => {
      await utils.inventory.tasks.list.invalidate();
    },
  });

  const handleSubmit = ({
    assignedToId,
    ...value
  }: z.infer<typeof taskSchema>) => {
    createTask({
      type: "transfer",
      assignedToId,
      items: [value],
    });
    onSave();
  };

  return (
    <div className="flex flex-col gap-4 self-stretch">
      <h1 className="text-2xl font-semibold">Create Transfer Task</h1>
      <Form
        className="flex flex-col space-y-4"
        onSubmit={handleSubmit}
        form={form}
      >
        <Field name="componentId">
          <Field.Label>Component</Field.Label>
          <Field.Description>Select the component to build</Field.Description>
          <Field.Control>
            <AsyncCombobox
              data={(query) => {
                const { data, isLoading } = api.component.list.useQuery({
                  filter: {
                    hasSubcomponents: { eq: true },
                    totalQuantity: { gt: 0 },
                  },
                  search: { query },
                });
                return {
                  isLoading: isLoading,
                  items: data?.rows ?? [],
                };
              }}
              keyAccessor={(component) => component.id}
            >
              {(component) => {
                return (
                  <Combobox.Option id={component.id}>
                    {component.id}
                  </Combobox.Option>
                );
              }}
            </AsyncCombobox>
          </Field.Control>
        </Field>
        <Field name="pickLocationId">
          <Field.Label>Pick Location</Field.Label>
          <Field.Description>
            Select the location to pick from
          </Field.Description>
          <Field.Control>
            <AsyncCombobox
              data={(query) => {
                const { data, isLoading } = api.inventory.quantity.useQuery(
                  {
                    filter: {
                      componentId: {
                        eq: componentId,
                      },
                      total: {
                        gt: 0,
                      },
                    },
                    search: { query },
                  },
                  {
                    enabled: !!componentId,
                  },
                );
                return {
                  isLoading: isLoading,
                  items: data?.rows ?? [],
                };
              }}
              keyAccessor={(location) =>
                `${location.locationId}-${location.batchId}`
              }
            >
              {(location) => {
                return (
                  <Combobox.Option
                    id={`${location.locationId}-${location.batchId}`}
                    textValue={`Loc: ${location.locationName} Batch: ${location.batchReference}`}
                  >
                    Loc: {location.locationName} - Batch:{" "}
                    {location.batchReference}
                  </Combobox.Option>
                );
              }}
            </AsyncCombobox>
          </Field.Control>
        </Field>
        <Field name="quantity">
          <Field.Label>Quantity</Field.Label>
          <Field.Description>Amount to move</Field.Description>
          <Field.Control>
            <Input type="number" />
          </Field.Control>
        </Field>
        <Field name="putLocationId">
          <Field.Label>Put Location</Field.Label>
          <Field.Description>Select destination location</Field.Description>
          <Field.Control>
            <Field.Control>
              <AsyncCombobox
                data={(query) => {
                  const { data, isLoading } =
                    api.inventory.locations.list.useQuery({
                      search: { query },
                    });
                  return {
                    isLoading: isLoading,
                    items: data?.rows ?? [],
                  };
                }}
                keyAccessor={(location) => location.id}
              >
                {(location) => {
                  return (
                    <Combobox.Option id={location.id} textValue={location.name}>
                      {location.name} - {location.groupName}
                    </Combobox.Option>
                  );
                }}
              </AsyncCombobox>
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
