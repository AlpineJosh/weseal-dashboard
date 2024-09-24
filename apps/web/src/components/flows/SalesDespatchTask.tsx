import { useState } from "react";
import { LocationPicker } from "@/components/LocationPicker";
import { api } from "@/utils/trpc/react";
import { useImmer } from "use-immer";
import { z } from "zod";

import type { RouterInputs, RouterOutputs } from "@repo/api";
import { Combobox } from "@repo/ui/components/control";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

export function SalesDespatchTaskForm({
  onSave,
  onExit,
}: {
  onSave: () => void;
  onExit: () => void;
}) {
  const [query, setQuery] = useState<string>("");

  const [values, setValues] = useImmer<{
    orderId: number | undefined;
    quantity: number;
    locationId: number | undefined;
  }>({
    orderId: undefined,
    quantity: 1,
    locationId: undefined,
  });
  const [task, setTask] = useImmer<RouterInputs["task"]["create"]>({
    type: "production",
    assignedToId: "",
    items: [],
  });

  const [items, setItems] = useImmer<
    (RouterInputs["task"]["create"]["items"][number] & {
      componentId: string;
    })[]
  >([]);

  const { data: order } = api.despatching.order.get.useQuery(
    {
      id: values.orderId as number,
    },
    { enabled: !!values.orderId },
  );

  const { mutate: createTask } = api.task.create.useMutation();
  const save = () => {
    createTask({
      type: "production",
      assignedToId: "1",
      items: items.map((item) => ({
        ...item,
        locationId: item.locationId as number,
      })),
    });
  };

  return (
    <div className="flex w-[800px] max-w-screen-md flex-col gap-4 self-stretch p-8">
      <h1 className="text-2xl font-semibold">Prepare Despatch</h1>
      <Form
        className="flex flex-row space-x-4"
        onSubmit={() => {
          console.log(values);
        }}
        schema={z.object({
          componentId: z.string(),
          locationId: z.string(),
          quantity: z.number(),
        })}
        defaultValues={values}
      >
        <>
          <Field name="component">
            <Field.Label>Sales Order</Field.Label>
            <Field.Description>Select the order to despatch</Field.Description>
            <Field.Control>
              <Combobox<
                RouterOutputs["despatching"]["order"]["list"]["rows"][number]
              >
                options={(query) => {
                  return api.despatching.order.list.useQuery({
                    pagination: {
                      page: 1,
                      size: 10,
                    },
                    filter: {
                      search: query,
                    },
                  });
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
                      textValue={order.id.toString()}
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
            order?.items?.map((item) => {
              return {
                id: item.componentId,
                quantity: item.quantityOrdered,
              };
            }) ?? []
          }
          value={items}
          onChange={(items) => {
            setItems(items);
          }}
        />
      )}
      <Button
        variant="primary"
        onPress={() => {
          save();
          close();
        }}
      >
        Create Despatch Task
      </Button>
    </div>
  );
}
