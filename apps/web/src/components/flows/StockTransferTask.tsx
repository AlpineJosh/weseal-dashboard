import { api } from "@/utils/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AsyncCombobox } from "node_modules/@repo/ui/src/components/control/combobox/combobox.component";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Combobox, Input } from "@repo/ui/components/control";
import { Button, Divider } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

const taskSchema = z.object({
  componentId: z.string(),
  pickLocationId: z.string(),
  putLocationId: z.number(),
  assignedToId: z.string(),
  quantity: z.coerce.number().min(0),
});

export function StockTransferTaskForm({
  onSave,
  onExit,
}: {
  onSave: () => void;
  onExit: () => void;
}) {
  const utils = api.useUtils();
  const form = useForm<z.infer<typeof taskSchema>>({
    defaultValues: {
      quantity: 1,
      assignedToId: undefined,
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
    quantity,
    pickLocationId,
    putLocationId,
  }: z.infer<typeof taskSchema>) => {
    const pick = pickLocationId.toString().split("-");
    createTask({
      type: "transfer",
      assignedToId,
      items: [
        {
          quantity,
          pickLocationId: Number(pick[0]),
          batchId: Number(pick[1]),
          putLocationId,
        },
      ],
    });
    onSave();
  };

  const state = form.watch();
  console.log(state);

  return (
    <div className="flex flex-col gap-4 self-stretch">
      <h1 className="text-2xl font-semibold">Create Transfer Task</h1>
      <Divider />
      <Form
        className="flex flex-col space-y-4 [--grid-cols:200px_1fr]"
        onSubmit={handleSubmit}
        form={form}
      >
        <Field name="componentId" layout="row">
          <Field.Label>Component</Field.Label>
          <Field.Control>
            <AsyncCombobox
              data={(query) => {
                const { data, isLoading } = api.component.list.useQuery({
                  filter: {
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
              textValueAccessor={(component) => component.id}
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
        <Field name="pickLocationId" layout="row">
          <Field.Label>Pick Location</Field.Label>
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
              textValueAccessor={(location) =>
                `${location.locationName} - ${location.batchReference}`
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
        <Field name="quantity" layout="row">
          <Field.Label>Quantity</Field.Label>
          <Field.Control>
            <Input type="number" />
          </Field.Control>
        </Field>
        <Field name="putLocationId" layout="row">
          <Field.Label>Put Location</Field.Label>
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
                textValueAccessor={(location) => location.name}
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
        <Field name="assignedToId" layout="row">
          <Field.Label>Assigned To</Field.Label>
          <Field.Control>
            <AsyncCombobox
              data={(query) => {
                const { data, isLoading } = api.profile.list.useQuery({
                  search: { query },
                });

                return { items: data?.rows ?? [], isLoading };
              }}
              keyAccessor={(profile) => profile.id}
              textValueAccessor={(profile) => profile.name ?? ""}
            >
              {(profile) => {
                return (
                  <Combobox.Option id={profile.id}>
                    {profile.name}
                  </Combobox.Option>
                );
              }}
            </AsyncCombobox>
          </Field.Control>
        </Field>
        <Divider />
        <div className="flex justify-end gap-2">
          <Button variant="plain" color="default" onPress={onExit}>
            Cancel
          </Button>
          <Button color="primary" type="submit">
            Create Task
          </Button>
        </div>
      </Form>
    </div>
  );
}
