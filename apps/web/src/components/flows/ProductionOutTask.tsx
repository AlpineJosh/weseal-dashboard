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
  productionJobId: z.coerce.number(),
  putLocationId: z.coerce.number(),
  items: z.array(
    z.object({
      componentId: z.string(),
      quantity: z.coerce.number(),
      putLocationId: z.number().optional(),
    }),
  ),
});

export function ProductionOutTaskForm({
  onSave,
  onExit,
}: {
  onSave: () => void;
  onExit: () => void;
}) {
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      componentId: undefined,
      productionJobId: undefined,
      putLocationId: undefined,
      items: [],
    },
  });

  const componentId = form.watch("componentId");

  // const { data: order } = api.receiving.orders.get.useQuery(
  //   {
  //     id: values.orderId as number,
  //   },
  //   { enabled: !!values.orderId },
  // );

  // const { data: orderItems } = api.production.jobs.get.useQuery(
  //   {
  //     id: productionJobId,
  //   },
  //   { enabled: !!productionJobId },
  // );

  // const [items, setItems] = useImmer<
  //   {
  //     componentId: string;
  //     locationId: number;
  //     batchId: number;
  //     quantity: number;
  //   }[]
  // >([]);

  // const { mutate: receiveOrder } = api.receiving.orders.receive.useMutation({
  //   onSuccess: async () => {
  //     await utils.inventory.tasks.list.invalidate();
  //   },
  // });

  const handleSubmit = (values: z.infer<typeof taskSchema>) => {
    console.log(values);
    // receiveOrder({
    //   id: values.purchaseOrderId,
    //   putLocationId: values.putLocationId,
    //   receiptDate: new Date(),
    //   items: values.items.map((item) => ({
    //     componentId: item.componentId,
    //     quantity: item.quantity,
    //   })),
    // });
    onSave();
  };

  return (
    <div className="flex flex-col gap-4 self-stretch">
      <h1 className="text-2xl font-semibold">Receive Purchase Order</h1>
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
                        outputComponentId: {
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
                textValueAccessor={(job) =>
                  job.batchNumber ?? job.id.toString()
                }
                keyAccessor={(job) => job.id}
              >
                {(job) => {
                  return (
                    <Combobox.Option
                      id={job.id}
                      textValue={job.batchNumber ?? job.id.toString()}
                    >
                      #{job.id} - {job.batchNumber}
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
                  const { data, isLoading } =
                    api.inventory.locations.list.useQuery({
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
                      {location.name} - {location.groupName}
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
            Receive Goods
          </Button>
        </div>
      </Form>
    </div>
  );
}
