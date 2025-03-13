import type { Decimal } from "decimal.js";
import { decimal } from "@/utils/decimal";
import { api } from "@/utils/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AsyncCombobox } from "node_modules/@repo/ui/src/components/control/combobox/combobox.component";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Combobox, NumberInput } from "@repo/ui/components/control";
import { Table } from "@repo/ui/components/display";
import { useToast } from "@repo/ui/components/display/toaster";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

const taskSchema = z.object({
  orderId: z.coerce.number(),
  locationId: z.coerce.number(),
  items: z.array(
    z.object({
      componentId: z.string(),
      quantity: decimal(),
    }),
  ),
});

export function PurchaseReceiptTaskForm({
  onSave,
  onExit,
}: {
  onSave: () => void;
  onExit: () => void;
}) {
  const { addToast } = useToast();
  const utils = api.useUtils();

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      orderId: undefined,
      locationId: undefined,
      items: [],
    },
  });

  const orderId = form.watch("orderId");
  const items = form.watch("items");

  console.log(form.watch());

  const { data: orderItems } = api.receiving.order.item.list.useQuery(
    {
      filter: {
        orderId: {
          eq: orderId,
        },
      },
    },
    { enabled: !!orderId },
  );

  const { mutate: receiveOrder } = api.receiving.receipt.receive.useMutation({
    onSuccess: async () => {
      await utils.receiving.order.item.list.invalidate();
      onSave();
      addToast({
        type: "success",
        message: "Purchase Order Received",
      });
    },
    onError: (error) => {
      addToast({
        type: "error",
        message: error.message,
      });
    },
  });

  const handleChange = (componentId: string, quantity: Decimal) => {
    const existingItem = items.find((item) => item.componentId === componentId);
    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      items.push({
        componentId,
        quantity,
      });
    }
    form.setValue("items", items);
  };

  const handleSubmit = (value: z.infer<typeof taskSchema>) => {
    receiveOrder(value);
  };

  return (
    <div className="flex flex-col gap-4 self-stretch">
      <h1 className="text-2xl font-semibold">Receive Purchase Order</h1>
      <Form
        className="flex flex-col space-y-4 [--grid-cols:200px_1fr]"
        onSubmit={handleSubmit}
        form={form}
      >
        <>
          <Field name="orderId" layout="row">
            <Field.Label>Purchase Order</Field.Label>
            <Field.Control>
              <AsyncCombobox
                data={(query) => {
                  const { data, isLoading } = api.receiving.order.list.useQuery(
                    {
                      search: {
                        query,
                      },
                      sort: [{ field: "orderDate", order: "desc" }],
                    },
                  );
                  return {
                    items: data?.rows ?? [],
                    isLoading,
                  };
                }}
                textValueAccessor={(order) => order.id.toString()}
                keyAccessor={(order) => order.id}
              >
                {(order) => {
                  return (
                    <Combobox.Option
                      id={order.id}
                      textValue={order.id.toString()}
                    >
                      #{order.id} - {order.supplierName}
                    </Combobox.Option>
                  );
                }}
              </AsyncCombobox>
            </Field.Control>
          </Field>
          <Field name="locationId" layout="row">
            <Field.Label>Receiving Location</Field.Label>
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
        </>
        {orderId && (
          <Table className="">
            <Table.Head>
              <Table.Column id="componentId">Component</Table.Column>
              <Table.Column id="componentDescription">Description</Table.Column>
              <Table.Column id="quantityOrdered">
                Quantity Expected
              </Table.Column>
              <Table.Column id="quantityReceived">
                Quantity Received
              </Table.Column>
            </Table.Head>
            <Table.Body data={orderItems?.rows ?? []}>
              {({ data }) => (
                <Table.Row key={data.componentId}>
                  <Table.Cell id="componentId">{data.componentId}</Table.Cell>
                  <Table.Cell id="componentDescription">
                    {data.componentDescription}
                  </Table.Cell>
                  <Table.Cell id="quantityOrdered">
                    {data.quantityOrdered.toFixed(6)}
                  </Table.Cell>
                  <Table.Cell id="quantityReceived">
                    <NumberInput
                      defaultValue={data.quantityOrdered.minus(
                        data.quantityReceived,
                      )}
                      onChange={(value) => {
                        handleChange(data.componentId, value);
                      }}
                    />
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="plain" color="default" onPress={onExit}>
            Cancel
          </Button>
          <Button
            isDisabled={!orderId}
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
