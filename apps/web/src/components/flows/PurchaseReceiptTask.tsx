"use client";

import { useState } from "react";
import { LocationPicker } from "@/components/LocationPicker";
import { SearchableListbox } from "@/components/SearchableListbox";
import { api } from "@/utils/trpc/react";
import { useImmer } from "use-immer";
import { z } from "zod";

import type { RouterInputs, RouterOutputs } from "@repo/api";
import type { FlowStepRendererProps } from "@repo/ui/components/navigation";
import { Combobox, Input, Select } from "@repo/ui/components/control";
import { Table } from "@repo/ui/components/display";
import { Badge, Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";
import { Card } from "@repo/ui/components/layout";
import { Flow } from "@repo/ui/components/navigation";

export function PurchaseReceiptTaskForm({ exit }: { exit: () => void }) {
  const [query, setQuery] = useState<string>("");

  const [values, setValues] = useImmer<{
    orderId: string | undefined;
    quantity: number;
    locationId: string | undefined;
  }>({
    orderId: undefined,
    quantity: 1,
    locationId: undefined,
  });

  // const { data: subcomponents } = api.component.subcomponents.useQuery(
  //   {
  //     orderId: values.orderId as string,
  //   },
  //   { enabled: !!values.orderId },
  // );

  const [items, setItems] = useImmer<
    {
      componentId: string;
      locationId: number;
      batchId: number;
      quantity: number;
    }[]
  >([]);

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
      <h1 className="text-2xl font-semibold">Create Production Task</h1>
      <Form
        className="flex flex-row space-x-4"
        onSubmit={() => {
          console.log(values);
        }}
        schema={z.object({
          orderId: z.string(),
          locationId: z.string(),
          quantity: z.number(),
        })}
        defaultValues={values}
      >
        <>
          <Field name="orderId">
            <Field.Label>Order</Field.Label>
            <Field.Description>Select the order to receive</Field.Description>
            <Field.Control>
              <Combobox<
                RouterOutputs["receiving"]["order"]["list"]["rows"][number]
              >
                options={(query) => {
                  return api.receiving.order.list.useQuery({
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
                    draft.orderId = orderId as string;
                  });
                }}
              >
                {(order) => {
                  return (
                    <Combobox.Option key={order.id} value={order}>
                      {order.id} - {order.supplier.name}
                    </Combobox.Option>
                  );
                }}
              </Combobox>
            </Field.Control>
          </Field>
          <Field name="quantity">
            <Field.Label>Quantity</Field.Label>
            <Field.Description>Amount to build</Field.Description>
            <Field.Control>
              <Input
                onChange={(e) => {
                  setValues({
                    ...values,
                    quantity: Math.max(+e.target.value, 1),
                  });
                }}
                type="number"
              />
            </Field.Control>
          </Field>
          <Field name="location">
            <Field.Label>Production Location</Field.Label>
            <Field.Description>Select the component to build</Field.Description>
            <Field.Control>
              <Field.Control>
                <Combobox<
                  RouterOutputs["inventory"]["locations"]["rows"][number]
                >
                  options={(query) => {
                    return api.inventory.locations.useQuery({
                      filter: {
                        search: query,
                      },
                    });
                  }}
                >
                  {(location) => {
                    return (
                      <Combobox.Option value={location}>
                        {location.name} - {location.group.name}
                      </Combobox.Option>
                    );
                  }}
                </Combobox>
              </Field.Control>
            </Field.Control>
          </Field>
        </>
      </Form>
      {/* {values.componentId && (
        <LocationPicker
          components={
            subcomponents?.map((subcomponent) => {
              return {
                id: subcomponent.subcomponentId,
                quantity: subcomponent.quantity * values.quantity,
              };
            }) ?? []
          }
          value={items}
          onChange={setItems}
        />
      )} */}
      <Button
        variant="primary"
        onPress={() => {
          save();
          close();
        }}
      >
        Save
      </Button>
    </div>
  );
}
