import { decimal } from "@/utils/decimal";
import { api } from "@/utils/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AsyncCombobox,
  Combobox,
} from "node_modules/@repo/ui/src/components/control/combobox/combobox.component";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Input, NumberInput } from "@repo/ui/components/control";
import { Table } from "@repo/ui/components/display";
import { Divider } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

const remainingQuantitySchema = z.object({
  componentId: z.string(),
  batchId: z.number().optional(),
  quantity: decimal(),
});

const taskSchema = z.object({
  productionJobId: z.number(),
  remainingQuantities: z.array(remainingQuantitySchema),
});

export function CompleteProductionActivity() {
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      productionJobId: undefined,
      remainingQuantities: [],
    },
  });

  const productionJobId = form.watch("productionJobId");

  // const { data: productionJobAllocations } = api.production.items.list.useQuery(
  //   {
  //     filter: {
  //       productionJobId: { eq: productionJobId },
  //     },
  //   },
  //   { enabled: !!productionJobId },
  // );

  const handleSubmit = (data: z.infer<typeof taskSchema>) => {
    console.log(data);
  };

  return (
    <div className="flex flex-col gap-4 self-stretch">
      <h1 className="text-2xl font-semibold">Complete Production Job</h1>
      <Divider />
      <Form
        form={form}
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 [--grid-cols:200px_1fr]"
      >
        <Field name="productionJobId" layout="row">
          <Field.Label>Production Job</Field.Label>
          <Field.Control>
            <AsyncCombobox
              data={(query) => {
                const { data, isLoading } = api.production.list.useQuery({
                  filter: {
                    isComplete: { eq: false },
                  },
                  search: { query },
                });
                return {
                  isLoading: isLoading,
                  items: data?.rows ?? [],
                };
              }}
              keyAccessor={(productionJob) => productionJob.id}
              textValueAccessor={(job) =>
                `${job.componentId} - ${job.batchReference}`
              }
            >
              {(productionJob) => {
                return (
                  <Combobox.Option id={productionJob.id}>
                    {productionJob.id}
                  </Combobox.Option>
                );
              }}
            </AsyncCombobox>
          </Field.Control>
        </Field>
        {/* {productionJobId && (
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
            <Table.Body data={productionJobAllocations?.rows ?? []}>
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
        )} */}
      </Form>
    </div>
  );
}
