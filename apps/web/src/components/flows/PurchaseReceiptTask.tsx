import { useState } from "react";
import { api } from "@/utils/trpc/react";
import { useImmer } from "use-immer";
import { z } from "zod";

import type { RouterOutputs } from "@repo/api";
import { Combobox, Input } from "@repo/ui/components/control";
import { Table } from "@repo/ui/components/display";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

export function PurchaseReceiptTaskForm({
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

  const { data: order } = api.receiving.order.get.useQuery(
    {
      id: values.orderId as number,
    },
    { enabled: !!values.orderId },
  );

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
    // createTask({
    //   type: "production",
    //   assignedToId: "1",
    //   items: items.map((item) => ({
    //     ...item,
    //     locationId: item.locationId as number,
    //   })),
    // });
    console.log(items);
    onSave();
  };

  return (
    <div className="flex flex-col gap-4 self-stretch">
      <h1 className="text-2xl font-semibold">Receive Purchase Order</h1>
      <Form
        className="flex flex-col space-y-4"
        onSubmit={() => {
          console.log(values);
        }}
        schema={z.object({
          orderId: z.number(),
          locationId: z.number(),
          quantity: z.number(),
        })}
        defaultValues={values}
      >
        <>
          <Field name="order">
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
                      {order.id} - {order.supplier.name}
                    </Combobox.Option>
                  );
                }}
              </Combobox>
            </Field.Control>
          </Field>
          <Field name="location">
            <Field.Label>Receiving Location</Field.Label>
            <Field.Description>
              Select the location to receive the order
            </Field.Description>
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
                  keyAccessor="id"
                  onSelectionChange={(locationId) => {
                    setValues((draft) => {
                      draft.locationId = locationId as number;
                    });
                  }}
                >
                  {(location) => {
                    return (
                      <Combobox.Option
                        value={location}
                        textValue={location.name}
                      >
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
      {order && (
        <Table className="-mx-4">
          <Table.Header>
            <Table.Column isRowHeader>Component</Table.Column>
            <Table.Column>Description</Table.Column>
            <Table.Column>Quantity Expected</Table.Column>
            <Table.Column>Quantity Received</Table.Column>
          </Table.Header>
          <Table.Body>
            {order.items.map((item) => (
              <Table.Row key={item.id}>
                <Table.Cell>{item.component.id}</Table.Cell>
                <Table.Cell>{item.component.description}</Table.Cell>
                <Table.Cell>{item.quantityOrdered}</Table.Cell>
                <Table.Cell>
                  <Input
                    type="number"
                    defaultValue={item.quantityOrdered || 0}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
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
          Receive Goods
        </Button>
      </div>
    </div>
  );
}
