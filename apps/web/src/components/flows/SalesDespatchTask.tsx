import { LocationPicker } from "@/components/LocationPicker";
import { api } from "@/utils/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AsyncCombobox } from "node_modules/@repo/ui/src/components/control/combobox/combobox.component";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Combobox } from "@repo/ui/components/control";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

const taskSchema = z.object({
  salesOrderId: z.number(),
  assignedToId: z.string(),
  items: z.array(
    z.object({
      componentId: z.string(),
      batchId: z.number(),
      quantity: z.number(),
      pickLocationId: z.number(),
    }),
  ),
});

export function SalesDespatchTaskForm({
  onSave,
  onExit,
}: {
  onSave: () => void;
  onExit: () => void;
}) {
  const utils = api.useUtils();

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      salesOrderId: undefined,
      assignedToId: undefined,
      items: [],
    },
  });

  const salesOrderId = form.watch("salesOrderId");

  const { data: orderItems } = api.despatching.order.items.list.useQuery(
    {
      filter: {
        orderId: { eq: salesOrderId },
      },
    },
    { enabled: !!salesOrderId },
  );

  const { mutate: createTask } = api.inventory.tasks.create.useMutation({
    onSuccess: async () => {
      await utils.inventory.tasks.list.invalidate();
    },
  });

  const handleSave = (values: z.infer<typeof taskSchema>) => {
    createTask({
      type: "despatch",
      ...values,
    });
    onSave();
  };

  return (
    <div className="flex flex-col gap-4 self-stretch">
      <h1 className="text-2xl font-semibold">Prepare Despatch</h1>
      <Form
        className="flex flex-row space-x-4"
        onSubmit={handleSave}
        form={form}
      >
        <>
          <Field name="component">
            <Field.Label>Sales Order</Field.Label>
            <Field.Description>Select the order to despatch</Field.Description>
            <Field.Control>
              <AsyncCombobox
                data={(query) => {
                  const { data, isLoading } =
                    api.despatching.order.list.useQuery({
                      search: {
                        query,
                      },
                    });

                  return { items: data?.rows ?? [], isLoading };
                }}
                keyAccessor={(order) => order.id}
              >
                {(order) => {
                  return (
                    <Combobox.Option
                      id={order.id}
                      textValue={order.id.toString()}
                    >
                      #{order.id} - {order.customerName}
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
        </>
      </Form>
      {salesOrderId && (
        <Controller
          control={form.control}
          name="items"
          render={({ field: { onChange, value } }) => (
            <LocationPicker
              components={
                orderItems?.rows.map((item) => {
                  return {
                    id: item.componentId,
                    quantity:
                      item.quantityOrdered - (item.quantityDespatched ?? 0),
                  };
                }) ?? []
              }
              value={value}
              onChange={onChange}
            />
          )}
        />
      )}
      <div className="flex justify-end gap-2">
        <Button variant="plain" color="default" onPress={onExit}>
          Cancel
        </Button>
        <Button
          isDisabled={!salesOrderId}
          variant="solid"
          color="primary"
          type="submit"
        >
          Create Despatch Task
        </Button>
      </div>
    </div>
  );
}
