import { LocationPicker } from "@/components/LocationPicker";
import { api } from "@/utils/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AsyncCombobox } from "node_modules/@repo/ui/src/components/control/combobox/combobox.component";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Combobox, Input } from "@repo/ui/components/control";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

interface ProductionTaskFormProps {
  onExit: () => void;
  onSave: () => void;
}

const taskSchema = z.object({
  componentId: z.string(),
  putLocationId: z.number(),
  assignedToId: z.string(),
  quantity: z.number(),
  items: z.array(
    z.object({
      componentId: z.string(),
      batchId: z.number(),
      pickLocationId: z.number(),
      quantity: z.number(),
    }),
  ),
});

export const ProductionTaskForm = ({
  onExit,
  onSave,
}: ProductionTaskFormProps) => {
  const utils = api.useUtils();

  const form = useForm<{
    componentId: string;
    putLocationId: number;
    assignedToId: string;
    quantity: number;
    items: {
      componentId: string;
      batchId: number;
      pickLocationId: number;
      quantity: number;
    }[];
  }>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      componentId: "",
      putLocationId: 0,
      assignedToId: "",
      quantity: 1,
      items: [],
    },
  });

  const values = form.watch();
  console.log(values);

  const componentId = form.watch("componentId");
  const quantity = form.watch("quantity");

  const { data: subcomponents } = api.component.subcomponents.useQuery(
    {
      componentId,
    },
    { enabled: !!componentId },
  );

  const { mutate: createTask } = api.inventory.tasks.create.useMutation({
    onSuccess: async () => {
      await utils.inventory.tasks.list.invalidate();
    },
  });

  const handleSubmit = ({
    putLocationId,
    assignedToId,
    items,
  }: z.infer<typeof taskSchema>) => {
    createTask({
      type: "production",
      assignedToId: assignedToId,
      items: items.map(({ batchId, quantity, pickLocationId }) => ({
        batchId,
        quantity,
        pickLocationId,
        putLocationId,
      })),
    });
    onSave();
  };

  const valid = form.formState.isValid;
  console.log(valid);

  return (
    <Form
      className="flex flex-col space-x-4"
      onSubmit={handleSubmit}
      form={form}
    >
      <div className="flex flex-col gap-4 self-stretch">
        <h1 className="text-2xl font-semibold">Create Production Task</h1>
        <div className="flex flex-row gap-4">
          <Field name="componentId">
            <Field.Label>Component</Field.Label>
            <Field.Description>Select the component to build</Field.Description>
            <Field.Control>
              <AsyncCombobox
                textValueAccessor={(component) => component.id}
                keyAccessor={(component) => component.id}
                data={(query: string) => {
                  const { data, isLoading } = api.component.list.useQuery({
                    filter: {
                      hasSubcomponents: { eq: true },
                    },
                    search: { query },
                  });
                  return {
                    isLoading: isLoading,
                    items: data?.rows ?? [],
                  };
                }}
              >
                {(component) => {
                  return (
                    <Combobox.Option id={component.id} textValue={component.id}>
                      {component.id}
                    </Combobox.Option>
                  );
                }}
              </AsyncCombobox>
            </Field.Control>
          </Field>
          <Field name="quantity">
            <Field.Label>Quantity</Field.Label>
            <Field.Description>Amount to build</Field.Description>
            <Field.Control>
              <Input type="number" step="any" />
            </Field.Control>
          </Field>
          <Field name="putLocationId">
            <Field.Label>Production Location</Field.Label>
            <Field.Description>Component destination</Field.Description>
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
          </Field>
          <Field name="assignedToId">
            <Field.Label>Assigned To</Field.Label>
            <Field.Description>
              Select the person to despatch the order
            </Field.Description>
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
        </div>
        {/* <Field name="batchReference">
            <Field.Label>Batch Reference</Field.Label>
            <Field.Description>Input the batch reference</Field.Description>
            <Field.Control>
              <Input type="text" />
            </Field.Control>
          </Field> */}
        <div className="width-full flex max-h-[400px] flex-col overflow-y-auto">
          {componentId ? (
            <Controller
              control={form.control}
              name="items"
              render={({ field: { value, onChange } }) => (
                <LocationPicker
                  components={
                    subcomponents?.map((subcomponent) => {
                      return {
                        id: subcomponent.subcomponentId,
                        quantity: subcomponent.quantity * quantity,
                      };
                    }) ?? []
                  }
                  value={value}
                  onChange={(items) => {
                    onChange({
                      target: {
                        value: items.map((item) => ({
                          ...item,
                          quantity: Number(item.quantity),
                        })),
                      },
                    });
                  }}
                />
              )}
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
            isDisabled={!componentId}
            variant="solid"
            color="primary"
            type="submit"
          >
            Create Task
          </Button>
        </div>
      </div>
    </Form>
  );
};
