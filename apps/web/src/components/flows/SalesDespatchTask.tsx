import { useState } from "react";
import { LocationPicker } from "@/components/LocationPicker";
import { api } from "@/utils/trpc/react";
import { useImmer } from "use-immer";
import { z } from "zod";

import type { RouterInputs, RouterOutputs } from "@repo/api";
import { Combobox } from "@repo/ui/components/control";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";
import { AsyncData, DataQueryResponse } from "@repo/ui/lib/async";

export function SalesDespatchTaskForm({
  onSave,
  onExit,
}: {
  onSave: () => void;
  onExit: () => void;
}) {
  const [values, setValues] = useImmer<{
    orderId: number | undefined;
  }>({
    orderId: undefined,
  });

  const { data: order } = api.despatching.order.get.useQuery(
    {
      id: values.orderId as number,
    },
    { enabled: !!values.orderId },
  );

  const { data: orderItems } = api.despatching.order.items.list.useQuery(
    {
      filter: {
        orderId: { eq: values.orderId as number },
      },
    },
    { enabled: !!values.orderId },
  );

  const [items, setItems] = useImmer<
    (RouterInputs["inventory"]["tasks"]["create"]["items"][number] & {
      componentId: string;
    })[]
  >([]);

  const { mutate: createTask } = api.inventory.tasks.create.useMutation();
  const save = () => {
    createTask({
      type: "despatch",
      assignedToId: "1",
      salesOrderId: values.orderId as number,
      items,
    });
  };

  return (
    <div className="flex flex-col gap-4 self-stretch">
      <h1 className="text-2xl font-semibold">Prepare Despatch</h1>
      <Form
        className="flex flex-row space-x-4"
        onSubmit={() => {
          console.log(values);
        }}
        schema={z.object({
          orderId: z.number(),
        })}
        defaultValues={values}
      >
        <>
          <Field name="component">
            <Field.Label>Sales Order</Field.Label>
            <Field.Description>Select the order to despatch</Field.Description>
            <Field.Control>
              <Combobox
                options={(query) => {
                  return api.despatching.order.list.useQuery({
                    pagination: {
                      page: 1,
                      size: 10,
                    },
                    search: {
                      query,
                    },
                  }) as AsyncData<
                    DataQueryResponse<
                      RouterOutputs["despatching"]["order"]["list"]["rows"][number]
                    >
                  >;
                }}
                onSelectionChange={(orderId) => {
                  setValues((draft) => {
                    draft.orderId = orderId as number;
                  });
                }}
                keyAccessor="id"
              >
                {(order) => {
                  return (
                    <Combobox.Option
                      key={order.id}
                      value={order}
                      textValue={order.id?.toString() ?? ""}
                    >
                      {order.id}
                    </Combobox.Option>
                  );
                }}
              </Combobox>
            </Field.Control>
          </Field>
        </>
      </Form>
      {values.orderId && (
        <LocationPicker
          components={
            orderItems?.rows.map((item) => {
              return {
                id: item.componentId!,
                quantity: item.quantityOrdered ?? 0,
              };
            }) ?? []
          }
          value={items}
          onChange={(items) => {
            setItems(items);
          }}
        />
      )}
      <div className="flex justify-end gap-2">
        <Button variant="plain" color="default" onPress={onExit}>
          Cancel
        </Button>
        <Button
          isDisabled={!order}
          variant="solid"
          color="primary"
          onPress={() => {
            save();
            close();
          }}
        >
          Create Despatch Task
        </Button>
      </div>
    </div>
  );
}
