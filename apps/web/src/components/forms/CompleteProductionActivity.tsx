import type Decimal from "decimal.js";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AsyncCombobox,
  Combobox,
} from "node_modules/@repo/ui/src/components/control/combobox/combobox.component";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { NumberInput } from "@repo/ui/components/control";
import { Table, useToast } from "@repo/ui/components/display";
import { Button, Divider } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

import { decimal } from "@/utils/decimal";
import { api } from "@/utils/trpc/react";

interface CompleteProductionActivityProps {
  onExit: () => void;
  onSave: () => void;
}
const remainingQuantitySchema = z.object({
  componentId: z.string(),
  batchId: z.number().nullable(),
  quantity: decimal(),
});

const taskSchema = z.object({
  productionJobId: z.number(),
  remainingQuantities: z.array(remainingQuantitySchema),
});

export function CompleteProductionActivity({
  onExit,
  onSave,
}: CompleteProductionActivityProps) {
  const { addToast } = useToast();
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      productionJobId: undefined,
      remainingQuantities: [],
    },
  });

  const productionJobId = form.watch("productionJobId");
  const remainingQuantities = form.watch("remainingQuantities");
  const { data: productionJobAllocations } =
    api.production.jobs.allocations.list.useQuery(
      {
        filter: {
          jobId: { eq: productionJobId },
        },
      },
      { enabled: !!productionJobId },
    );

  const { mutate: completeProductionJob } =
    api.production.jobs.completeJob.useMutation({
      onSuccess: () => {
        addToast({
          type: "success",
          message: "Production Job Completed",
        });
        onSave();
      },
      onError: (error) => {
        addToast({
          type: "error",
          message: error.message,
        });
      },
    });

  const handleSubmit = (data: z.infer<typeof taskSchema>) => {
    completeProductionJob({
      id: data.productionJobId,
      remainingQuantities: data.remainingQuantities.map((item) => ({
        quantity: item.quantity,
        reference: { componentId: item.componentId, batchId: item.batchId },
      })),
    });
  };

  const handleChange = (
    componentId: string,
    batchId: number,
    quantity: Decimal,
  ) => {
    const existingItem = remainingQuantities.find(
      (item) => item.componentId === componentId && item.batchId === batchId,
    );
    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      remainingQuantities.push({
        componentId,
        batchId,
        quantity,
      });
    }
    form.setValue("remainingQuantities", remainingQuantities);
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
                const { data, isLoading } = api.production.jobs.list.useQuery({
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
              {(job) => {
                return (
                  <Combobox.Option id={job.id}>
                    {job.componentId} - {job.batchReference}
                  </Combobox.Option>
                );
              }}
            </AsyncCombobox>
          </Field.Control>
        </Field>
        {productionJobId && (
          <Table className="">
            <Table.Head>
              <Table.Column id="componentId">Component</Table.Column>
              <Table.Column id="componentDescription">Description</Table.Column>
              <Table.Column id="totalQuantity">Total Quantity</Table.Column>
              <Table.Column id="remainingQuantity">
                Expected Remaining
              </Table.Column>
              <Table.Column id="actualRemainingQuantity">
                Actual Remaining
              </Table.Column>
            </Table.Head>
            <Table.Body data={productionJobAllocations?.rows ?? []}>
              {({ data }) => (
                <Table.Row key={data.componentId}>
                  <Table.Cell id="componentId">{data.componentId}</Table.Cell>
                  <Table.Cell id="componentDescription">
                    {data.componentDescription}
                  </Table.Cell>
                  <Table.Cell id="totalQuantity">
                    {data.totalQuantity.toFixed(6)}
                  </Table.Cell>
                  <Table.Cell id="usedQuantity">
                    {data.usedQuantity.toFixed(6)}
                  </Table.Cell>
                  <Table.Cell id="remainingQuantity">
                    {data.remainingQuantity.toFixed(6)}
                  </Table.Cell>
                  <Table.Cell id="actualRemainingQuantity">
                    <NumberInput
                      defaultValue={data.remainingQuantity}
                      onChange={(value) => {
                        handleChange(data.componentId, data.batchId, value);
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
          <Button variant="solid" color="primary" type="submit">
            Complete Job
          </Button>
        </div>
      </Form>
    </div>
  );
}
