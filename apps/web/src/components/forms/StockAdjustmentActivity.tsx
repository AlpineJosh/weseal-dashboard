import { decimal } from "@/utils/decimal";
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
  locationId: z.string(),
  quantity: decimal(),
});

export function StockAdjustmentTaskForm({
  onSave,
  onExit,
}: {
  onSave: () => void;
  onExit: () => void;
}) {
  const form = useForm<z.infer<typeof taskSchema>>({
    defaultValues: {
      quantity: 1,
      locationId: undefined,
      componentId: undefined,
    },
    resolver: zodResolver(taskSchema),
  });

  const componentId = form.watch("componentId");

  const { mutate: createMovement } = api.inventory.movements.create.useMutation(
    {},
  );

  const handleSubmit = ({
    locationId,
    quantity,
  }: z.infer<typeof taskSchema>) => {
    const [locId, batchId] = locationId.split("-").map(Number) as [
      number,
      number,
    ];
    console.log(locId, batchId, quantity);
    createMovement({
      batchId,
      locationId: locId,
      quantity,
    });
    onSave();
  };

  return (
    <div className="flex flex-col gap-4 self-stretch">
      <h1 className="text-2xl font-semibold">Adjust Stock</h1>
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

        <Field name="locationId" layout="row">
          <Field.Label>Stock Location</Field.Label>
          <Field.Control>
            <AsyncCombobox
              data={(query) => {
                const { data, isLoading } = api.inventory.list.useQuery(
                  {
                    filter: {
                      componentId: {
                        eq: componentId,
                      },
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

        <Field name="quantity" layout="row" valueAsNumber>
          <Field.Label>Adjust By (+/-)</Field.Label>
          <Field.Control>
            <Input type="number" />
          </Field.Control>
        </Field>

        <Divider />
        <div className="flex justify-end gap-2">
          <Button variant="plain" color="default" onPress={onExit}>
            Cancel
          </Button>
          <Button color="primary" type="submit">
            Log Adjustment
          </Button>
        </div>
      </Form>
    </div>
  );
}
