import { decimal } from "@/utils/decimal";
import { api } from "@/utils/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Decimal } from "decimal.js";
import { AsyncCombobox } from "node_modules/@repo/ui/src/components/control/combobox/combobox.component";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Combobox, Input } from "@repo/ui/components/control";
import { useToast } from "@repo/ui/components/display/toaster";
import { Button, Divider } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

const taskSchema = z.object({
  componentId: z.string(),
  productionJobId: z.coerce.number(),
  putLocationId: z.coerce.number(),
  quantity: decimal(),
});

export function ProductionOutTaskForm({
  onSave,
  onExit,
}: {
  onSave: () => void;
  onExit: () => void;
}) {
  const { addToast } = useToast();
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      componentId: undefined,
      productionJobId: undefined,
      putLocationId: undefined,
      quantity: new Decimal(1),
    },
  });

  const componentId = form.watch("componentId");

  const { mutate: processProduction } =
    api.production.processOutput.useMutation({
      onSuccess: async () => {
        onSave();
        addToast({
          type: "success",
          message: "Production Out Logged",
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
    productionJobId,
    quantity,
  }: z.infer<typeof taskSchema>) => {
    processProduction({
      id: productionJobId,
      quantity,
    });
    onSave();
  };

  return (
    <div className="flex flex-col gap-4 self-stretch">
      <h1 className="text-2xl font-semibold">Log Production Out</h1>
      <Divider />
      <Form
        className="flex flex-col space-y-4 [--grid-cols:200px_1fr]"
        onSubmit={handleSubmit}
        form={form}
      >
        <>
          <Field name="componentId" layout="row">
            <Field.Label>Component</Field.Label>
            <Field.Control>
              <AsyncCombobox
                data={(query) => {
                  const { data, isLoading } = api.component.list.useQuery({
                    search: {
                      query,
                    },
                  });
                  return {
                    items: data?.rows ?? [],
                    isLoading,
                  };
                }}
                textValueAccessor={(component) => component.id}
                keyAccessor={(component) => component.id}
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
          <Field name="productionJobId" layout="row">
            <Field.Label>Production Job</Field.Label>
            <Field.Control>
              <AsyncCombobox
                data={(query) => {
                  const { data, isLoading } = api.production.list.useQuery(
                    {
                      search: {
                        query,
                      },
                      filter: {
                        componentId: {
                          eq: componentId,
                        },
                      },
                    },
                    {
                      enabled: !!componentId,
                    },
                  );
                  return {
                    items: data?.rows ?? [],
                    isLoading,
                  };
                }}
                textValueAccessor={(job) => job.batchReference}
                keyAccessor={(job) => job.id}
              >
                {(job) => {
                  return (
                    <Combobox.Option id={job.id} textValue={job.batchReference}>
                      #{job.id} - {job.batchReference}
                    </Combobox.Option>
                  );
                }}
              </AsyncCombobox>
            </Field.Control>
          </Field>
          <Field name="putLocationId" layout="row">
            <Field.Label>Stock Location</Field.Label>
            <Field.Control>
              <AsyncCombobox
                data={(query) => {
                  const { data, isLoading } = api.location.list.useQuery({
                    search: {
                      query,
                    },
                  });
                  return {
                    items: data?.rows ?? [],
                    isLoading,
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
            <Field.Label>Quantity</Field.Label>
            <Field.Control>
              <Input type="number" />
            </Field.Control>
          </Field>
        </>
        <Divider />

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
            Log Production Out
          </Button>
        </div>
      </Form>
    </div>
  );
}
