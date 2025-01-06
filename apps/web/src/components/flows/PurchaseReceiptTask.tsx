import { api } from "@/utils/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AsyncCombobox } from "node_modules/@repo/ui/src/components/control/combobox/combobox.component";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Combobox, Input } from "@repo/ui/components/control";
import { Table } from "@repo/ui/components/display";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

const taskSchema = z.object({
  purchaseOrderId: z.coerce.number(),
  putLocationId: z.coerce.number(),
  items: z.array(
    z.object({
      componentId: z.string(),
      quantity: z.coerce.number(),
      putLocationId: z.number().optional(),
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
  const utils = api.useUtils();

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      purchaseOrderId: undefined,
      putLocationId: undefined,
      items: [],
    },
  });

  const purchaseOrderId = form.watch("purchaseOrderId");

  // const { data: order } = api.receiving.orders.get.useQuery(
  //   {
  //     id: values.orderId as number,
  //   },
  //   { enabled: !!values.orderId },
  // );

  const { data: orderItems } = api.receiving.orders.items.list.useQuery(
    {
      filter: {
        orderId: {
          eq: purchaseOrderId,
        },
      },
    },
    { enabled: !!purchaseOrderId },
  );

  // const [items, setItems] = useImmer<
  //   {
  //     componentId: string;
  //     locationId: number;
  //     batchId: number;
  //     quantity: number;
  //   }[]
  // >([]);

  const { mutate: receiveOrder } = api.receiving.orders.receive.useMutation({
    onSuccess: async () => {
      await utils.inventory.tasks.list.invalidate();
    },
  });

  const handleSubmit = (values: z.infer<typeof taskSchema>) => {
    receiveOrder({
      id: values.purchaseOrderId,
      putLocationId: values.putLocationId,
      receiptDate: new Date(),
      items: values.items.map((item) => ({
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
        className="flex flex-col space-y-4 [--grid-cols:200px_1fr]"
        onSubmit={handleSubmit}
        form={form}
      >
        <>
          <Field name="purchaseOrderId" layout="row">
            <Field.Label>Purchase Order</Field.Label>
            <Field.Control>
              <AsyncCombobox
                data={(query) => {
                  const { data, isLoading } =
                    api.receiving.orders.list.useQuery({
                      search: {
                        query,
                      },
                      sort: [{ field: "orderDate", order: "desc" }],
                    });
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
          <Field name="putLocationId" layout="row">
            <Field.Label>Receiving Location</Field.Label>
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
                      {location.name}
                    </Combobox.Option>
                  );
                }}
              </AsyncCombobox>
            </Field.Control>
          </Field>
        </>
        {purchaseOrderId && (
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
                <Table.Row key={data.id}>
                  <Table.Cell id="componentId">{data.componentId}</Table.Cell>
                  <Table.Cell id="componentDescription">
                    {data.componentDescription}
                  </Table.Cell>
                  <Table.Cell id="quantityOrdered">
                    {data.quantityOrdered}
                  </Table.Cell>
                  <Table.Cell id="quantityReceived">
                    <Input type="number" defaultValue={data.quantityOrdered} />
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
            isDisabled={!purchaseOrderId}
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
