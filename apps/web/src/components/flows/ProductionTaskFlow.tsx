import { useEffect } from "react";
import { LocationPicker } from "@/components/LocationPicker";
import { api } from "@/utils/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AsyncCombobox } from "node_modules/@repo/ui/src/components/control/combobox/combobox.component";
import { Controller, useForm } from "react-hook-form";
import { useImmer } from "use-immer";
import { z } from "zod";

import { faPlus } from "@repo/pro-solid-svg-icons";
import { Combobox, Input, Select } from "@repo/ui/components/control";
import { Button, Divider, Icon } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";
import { Heading } from "@repo/ui/components/typography";

interface ProductionTaskFormProps {
  onExit: () => void;
  onSave: () => void;
}

const taskSchema = z.object({
  componentId: z.string(),
  putLocationId: z.number(),
  assignedToId: z.string(),
  quantity: z.coerce.number(),
  items: z
    .array(
      z.object({
        componentId: z.string(),
        batchId: z.number(),
        pickLocationId: z.number(),
        quantity: z.number(),
      }),
    )
    .and(
      z.union([
        z.object({
          productionJobId: z.number(),
        }),
        z.object({
          batchReference: z.string(),
          putLocationId: z.number(),
        }),
      ]),
    ),
});

interface CreateType {
  componentId: string;
  putLocationId?: number;
  productionJobId?: number;
  batchReference?: string;
  assignedToId: string;
  quantity: number;
  items: {
    componentId: string;
    batchId: number;
    pickLocationId: number;
    quantity: number;
  }[];
}

export const ProductionTaskForm = ({
  onExit,
  onSave,
}: ProductionTaskFormProps) => {
  const [newJob, setNewJob] = useImmer(false);
  const utils = api.useUtils();

  const form = useForm<CreateType>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      componentId: "",
      assignedToId: "",
      quantity: 1,
      items: [],
    },
  });

  const componentId = form.watch("componentId");
  const quantity = form.watch("quantity");
  const productionJobId = form.watch("productionJobId");
  const batchReference = form.watch("batchReference");
  const jobReady = !!productionJobId || !!batchReference;

  const { data: subcomponents } = api.component.subcomponents.useQuery(
    {
      componentId,
    },
    { enabled: !!componentId },
  );

  const { data: productionJobs } = api.production.list.useQuery(
    {
      filter: {
        outputComponentId: { eq: componentId },
      },
    },
    { enabled: !!componentId },
  );

  useEffect(() => {
    if (componentId && productionJobs && productionJobs.rows.length === 0) {
      setNewJob(true);
    }
  }, [componentId, productionJobs, setNewJob]);

  const { mutate: createTask } = api.inventory.tasks.create.useMutation({
    onSuccess: async () => {
      await utils.inventory.tasks.items.list.invalidate();
    },
  });

  const handleSubmit = ({ putLocationId, assignedToId, items }: CreateType) => {
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

  return (
    <Form
      className="flex flex-col space-x-4"
      onSubmit={handleSubmit}
      form={form}
    >
      <div className="flex flex-col items-stretch gap-4 [--grid-cols:200px_1fr]">
        <Heading>Create Production Task</Heading>
        <Divider />
        <Field name="componentId" layout="row">
          <Field.Label>Component</Field.Label>
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
        {productionJobs && productionJobs.rows.length > 0 && (
          <>
            <Divider />
            <Field name="productionJobId" layout="row">
              <Field.Label>Production Job</Field.Label>
              <Field.Control>
                <span className="flex flex-row gap-2">
                  <Select
                    className="flex-1"
                    items={productionJobs.rows}
                    onChange={() => {
                      setNewJob(false);
                    }}
                  >
                    {(job) => {
                      return (
                        <Select.Option id={job.id}>
                          {job.batchNumber ?? job.id}
                        </Select.Option>
                      );
                    }}
                  </Select>
                  <Button
                    color="primary"
                    variant="solid"
                    onPress={() => {
                      setNewJob(true);
                    }}
                  >
                    <Icon icon={faPlus} />
                    Create Job
                  </Button>
                </span>
              </Field.Control>
            </Field>
          </>
        )}
        {newJob && (
          <Field name="batchReference" layout="row">
            <Field.Label>Batch Reference</Field.Label>
            <Field.Control>
              <Input type="text" />
            </Field.Control>
          </Field>
        )}
        {newJob && (
          <Field name="putLocationId" layout="row">
            <Field.Label>Production Location</Field.Label>
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
        )}

        {productionJobs && (
          <Field name="quantity" layout="row">
            <Field.Label>
              {newJob ? "Quantity" : "Additional Quantity"}
            </Field.Label>
            <Field.Control>
              <Input type="number" />
            </Field.Control>
          </Field>
        )}
        {productionJobs && (
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
        )}
        {/* <Field name="batchReference">
            <Field.Label>Batch Reference</Field.Label>
            <Field.Description>Input the batch reference</Field.Description>
            <Field.Control>
              <Input type="text" />
            </Field.Control>
          </Field> */}
        <div className="-mx-8 flex max-h-[400px] flex-col overflow-y-auto border-b border-t border-content/10 bg-background-muted px-8">
          {jobReady ? (
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
                Please select a component and assign a production job
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
