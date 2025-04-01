import { zodResolver } from "@hookform/resolvers/zod";
import { AsyncCombobox } from "node_modules/@repo/ui/src/components/control/combobox/combobox.component";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Combobox, NumberInput } from "@repo/ui/components/control";
import { useToast } from "@repo/ui/components/display/toaster";
import { Button, Divider } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

import { decimal } from "@/utils/decimal";
import { api } from "@/utils/trpc/react";

const taskSchema = z.object({
  componentId: z.string(),
  batchId: z.number().nullable(),
  pickLocationId: z.number(),
  putLocationId: z.number(),
  assignedToId: z.string(),
  quantity: decimal(),
});

export function StockTransferTaskForm({
  onSave,
  onExit,
}: {
  onSave: () => void;
  onExit: () => void;
}) {
  const { addToast } = useToast();
  const utils = api.useUtils();
  const form = useForm<z.infer<typeof taskSchema>>({
    defaultValues: {
      quantity: 1,
      batchId: null,
      assignedToId: undefined,
      pickLocationId: undefined,
      putLocationId: undefined,
      componentId: undefined,
    },
    resolver: zodResolver(taskSchema),
  });
  const componentId = form.watch("componentId");
  const batchId = form.watch("batchId");

  const { data: component } = api.component.get.useQuery(
    { id: componentId },
    { enabled: !!componentId },
  );

  const { mutate: createTask } = api.inventory.createTransferTask.useMutation({
    onSuccess: async () => {
      await utils.task.allocations.list.invalidate();
      onSave();
      addToast({
        type: "success",
        message: "Transfer Task Created",
      });
    },
    onError: (error) => {
      addToast({
        type: "error",
        message: error.message,
      });
    },
  });

  const handleSubmit = ({
    assignedToId,
    quantity,
    pickLocationId,
    putLocationId,
    componentId,
    batchId,
  }: z.infer<typeof taskSchema>) => {
    createTask({
      assignedToId,
      putLocationId,
      allocations: [
        {
          reference: {
            componentId,
            batchId,
          },
          quantity,
          pickLocationId,
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
        {component?.isBatchTracked && (
          <Field name="batchId" layout="row">
            <Field.Label>Batch</Field.Label>
            <Field.Control>
              <AsyncCombobox
                data={(query) => {
                  const { data, isLoading } = api.batch.list.useQuery({
                    filter: {
                      componentId: {
                        eq: componentId,
                      },
                    },
                    search: { query },
                  });
                  return {
                    isLoading: isLoading,
                    items: data?.rows ?? [],
                  };
                }}
                keyAccessor={(batch) => batch.id}
                textValueAccessor={(batch) => batch.batchReference}
              >
                {(batch) => {
                  return (
                    <Combobox.Option id={batch.id}>
                      {batch.batchReference}
                    </Combobox.Option>
                  );
                }}
              </AsyncCombobox>
            </Field.Control>
          </Field>
        )}
        <Field name="pickLocationId" layout="row">
          <Field.Label>Pick Location</Field.Label>
          <Field.Control>
            <AsyncCombobox
              data={(query) => {
                const { data, isLoading } = api.inventory.list.useQuery(
                  {
                    filter: {
                      componentId: {
                        eq: componentId,
                      },
                      ...(batchId && {
                        batchId: {
                          eq: batchId,
                        },
                      }),
                      totalQuantity: {
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
              keyAccessor={(location) => location.locationId}
              textValueAccessor={(location) => location.locationName}
            >
              {(location) => {
                return (
                  <Combobox.Option
                    id={location.locationId}
                    textValue={location.locationName}
                  >
                    {location.locationName}
                  </Combobox.Option>
                );
              }}
            </AsyncCombobox>
          </Field.Control>
        </Field>
        <Field name="quantity" layout="row" valueAsNumber>
          <Field.Label>Quantity</Field.Label>
          <Field.Control>
            <Controller
              control={form.control}
              name="quantity"
              render={({ field }) => <NumberInput {...field} />}
            />
          </Field.Control>
        </Field>
        <Field name="putLocationId" layout="row">
          <Field.Label>Put Location</Field.Label>
          <Field.Control>
            <Field.Control>
              <AsyncCombobox
                data={(query) => {
                  const { data, isLoading } = api.location.list.useQuery({
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
                      {location.name}
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
              textValueAccessor={(profile) => profile.name}
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
