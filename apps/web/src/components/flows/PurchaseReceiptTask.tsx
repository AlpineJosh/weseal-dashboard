import { useState } from "react";
import { api } from "@/utils/trpc/react";
import { useImmer } from "use-immer";
import { z } from "zod";

import type { RouterOutputs } from "@repo/api";
import { Combobox, Input } from "@repo/ui/components/control";
import { Table } from "@repo/ui/components/display";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";
import { AsyncData, DataQueryResponse } from "@repo/ui/lib/async";

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

  const { data: order } = api.receiving.orders.get.useQuery(
    {
      id: values.orderId as number,
    },
    { enabled: !!values.orderId },
  );

  const { data: orderItems } = api.receiving.orders.items.list.useQuery(
    {
      filter: {
        orderId: {
          eq: values.orderId as number,
        },
      },
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

  const { mutate: receiveOrder } = api.receiving.orders.receive.useMutation();
  const save = () => {
    receiveOrder({
      id: values.orderId as number,
      putLocationId: values.locationId as number,
      receiptDate: new Date(),
      items: items.map((item) => ({
        componentId: item.componentId,
        quantity: item.quantity,
      })),
    });
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
              <Combobox
                options={(query) => {
                  return api.receiving.orders.list.useQuery({
                    pagination: {
                      page: 1,
                      size: 10,
                    },
                    search: {
                      query,
                    },
                  }) as AsyncData<
                    DataQueryResponse<
                      RouterOutputs["receiving"]["orders"]["list"]["rows"][number]
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
                      {order.id} - {order.supplierName}
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
                <Combobox
                  options={(query) => {
                    return api.inventory.locations.list.useQuery({
                      search: {
                        query,
                      },
                    }) as AsyncData<
                      DataQueryResponse<
                        RouterOutputs["inventory"]["locations"]["list"]["rows"][number]
                      >
                    >;
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
                        textValue={location.name ?? ""}
                      >
                        {location.name} - {location.groupName}
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
            {orderItems?.rows.map((item) => (
              <Table.Row key={item.id}>
                <Table.Cell>{item.componentId}</Table.Cell>
                <Table.Cell>{item.componentDescription}</Table.Cell>
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
