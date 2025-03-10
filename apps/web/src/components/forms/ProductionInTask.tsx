import { useEffect } from "react";
import { LocationPicker } from "@/components/LocationPicker";
import { decimal } from "@/utils/decimal";
import { api } from "@/utils/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientErrorLike } from "@trpc/client";
import { AsyncCombobox } from "node_modules/@repo/ui/src/components/control/combobox/combobox.component";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { faPlus } from "@repo/pro-solid-svg-icons";
import { Combobox, Input, Select } from "@repo/ui/components/control";
import { useToast } from "@repo/ui/components/display/toaster";
import { Button, Divider, Icon } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";
import { Heading } from "@repo/ui/components/typography";

interface ProductionTaskFormProps {
  onExit: () => void;
  onSave: () => void;
}

const taskItemInput = z.object({
  componentId: z.string(),
  batchId: z.number().optional(),
  locationId: z.number(),
  quantity: decimal(),
});

const taskInput = z.object({
  assignedToId: z.string(),
  items: z.array(taskItemInput),
  quantity: decimal(),
  inputLocationId: z.number(),
});

const newProductionTaskInput = taskInput.extend({
  type: z.literal("production-new"),
  outputComponentId: z.string(),
  batchReference: z.string(),
  outputLocationId: z.number(),
});

const existingProductionTaskInput = taskInput.extend({
  type: z.literal("production-existing"),
  productionJobId: z.number(),
});

const productionTaskInput = z.discriminatedUnion("type", [
  newProductionTaskInput,
  existingProductionTaskInput,
]);

export const ProductionTaskForm = ({
  onExit,
  onSave,
}: ProductionTaskFormProps) => {
  const utils = api.useUtils();
  const { addToast } = useToast();

  const form = useForm<z.infer<typeof productionTaskInput>>({
    resolver: zodResolver(productionTaskInput),
    defaultValues: {
      type: "production-existing",
      assignedToId: "",
      quantity: 1,
      items: [],
    },
  });

  const formData = form.watch();
  console.log(formData);

  const type = form.watch("type");

  const componentId = form.watch("outputComponentId");
  const quantity = form.watch("quantity");
  const productionJobId = form.watch("productionJobId");
  const batchReference = form.watch("batchReference");
  const { data: component } = api.component.get.useQuery(
    {
      id: componentId,
    },
    { enabled: !!componentId },
  );
  const jobReady =
    (component && !component.isBatchTracked) ||
    !!productionJobId ||
    !!batchReference;

  const { data: subcomponents } = api.component.subcomponent.list.useQuery(
    {
      filter: {
        componentId: { eq: componentId },
      },
    },
    { enabled: !!component },
  );

  const { data: productionJobs } = api.production.list.useQuery(
    {
      filter: {
        componentId: { eq: componentId },
        isComplete: { eq: false },
      },
    },
    { enabled: component?.isBatchTracked },
  );

  useEffect(() => {
    if (component) {
      if (!component.isBatchTracked) {
        form.setValue("type", "production-new");
      } else if (productionJobs?.rows.length === 0) {
        form.setValue("type", "production-new");
      }
    }
  }, [component, productionJobs, form]);

  const onSuccess = async () => {
    await utils.task.item.list.invalidate();
    onSave();
    addToast({
      type: "success",
      message: "Production Task Created",
    });
  };

  const onError = (error: TRPCClientErrorLike<any>) => {
    addToast({
      type: "error",
      message: error.message,
    });
  };

  const { mutate: createTask } = api.production.createJobTask.useMutation({
    onSuccess,
    onError,
  });

  const { mutate: addToTask } = api.production.addToJob.useMutation({
    onSuccess,
    onError,
  });

  const handleSubmit = (input: z.infer<typeof productionTaskInput>) => {
    console.log(input);
    if (input.type === "production-new") {
      createTask({
        componentId: input.outputComponentId,
        batchReference: input.batchReference,
        assignedToId: input.assignedToId,
        outputLocationId: input.outputLocationId,
        targetQuantity: input.quantity,
        items: input.items,
        inputLocationId: input.inputLocationId,
      });
    } else {
      addToTask({
        id: input.productionJobId,
        assignedToId: input.assignedToId,
        items: input.items,
        inputLocationId: input.inputLocationId,
        additionalQuantity: input.quantity,
      });
    }
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
        <Field name="outputComponentId" layout="row">
          <Field.Label>Component</Field.Label>
          <Field.Control>
            <AsyncCombobox
              textValueAccessor={(component) => component.id}
              keyAccessor={(component) => component.id}
              data={(query: string) => {
                const { data, isLoading } = api.component.list.useQuery({
                  filter: {
                    hasSubcomponents: { eq: true },
                    isStockTracked: { eq: true },
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
        {component?.isBatchTracked && productionJobs && (
          <>
            {productionJobs.rows.length > 0 && (
              <>
                <Divider />
                <Field name="productionJobId" layout="row">
                  <Field.Label>Production Job</Field.Label>
                  <span className="flex flex-row gap-2">
                    <Field.Control>
                      <Select
                        aria-label="Production Job"
                        className="flex-1"
                        items={productionJobs.rows}
                        onChange={() => {
                          form.setValue("type", "production-existing");
                        }}
                      >
                        {(job) => (
                          <Select.Option id={job.id}>
                            {job.batchReference}
                          </Select.Option>
                        )}
                      </Select>
                    </Field.Control>
                    <Button
                      color="primary"
                      variant="solid"
                      onPress={() => {
                        form.setValue("type", "production-new");
                      }}
                    >
                      <Icon icon={faPlus} />
                      New Job
                    </Button>
                  </span>
                </Field>
              </>
            )}
            {type === "production-new" && (
              <Field name="batchReference" layout="row">
                <Field.Label>Batch Reference</Field.Label>
                <Field.Control>
                  <Input type="text" required />
                </Field.Control>
              </Field>
            )}
          </>
        )}
        {type === "production-new" && (
          <Field name="outputLocationId" layout="row">
            <Field.Label>Job Output Location</Field.Label>
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
          </Field>
        )}
        <Divider />

        <Field name="inputLocationId" layout="row">
          <Field.Label>Input Location</Field.Label>
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
        </Field>
        <Field name="quantity" layout="row" valueAsNumber>
          <Field.Label>
            {type === "production-new" ? "Quantity" : "Additional Quantity"}
          </Field.Label>
          <Field.Control>
            <Input type="number" />
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
        <div className="-mx-8 flex max-h-[400px] flex-col overflow-y-auto border-b border-t border-content/10 bg-background-muted px-8">
          {jobReady ? (
            <Controller
              control={form.control}
              name="items"
              render={({ field: { value, onChange } }) => (
                <LocationPicker
                  components={
                    subcomponents?.rows.map((subcomponent) => {
                      return {
                        id: subcomponent.subcomponentId,
                        quantity: subcomponent.quantityRequired.mul(quantity),
                      };
                    }) ?? []
                  }
                  value={value}
                  onChange={(items) => {
                    console.log(items);
                    onChange({
                      target: {
                        value: items,
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
          <Button variant="solid" color="primary" type="submit">
            Create Task
          </Button>
        </div>
      </div>
    </Form>
  );
};
