"use client";

import { Datatable, Modal } from "@repo/ui/components/display";
import { Button, Divider } from "@repo/ui/components/element";
import { Heading, Subheading, TextLink } from "@repo/ui/components/typography";

import { ProductionTaskForm } from "@/components/forms/ProductionInTask";
import { PurchaseReceiptTaskForm } from "@/components/forms/PurchaseReceiptActivity";
import { SalesDespatchTaskForm } from "@/components/forms/SalesDespatchTask";
import { StockTransferTaskForm } from "@/components/forms/StockTransferTask";
import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

export const runtime = "edge";

// const taskTypes = {
//   receipt: { label: "Receipt", color: "green" },
//   despatch: { label: "Despatch", color: "red" },
//   production: { label: "Production", color: "blue" },
//   transfer: { label: "Transfer", color: "yellow" },
//   correction: { label: "Correction", color: "purple" },
//   wastage: { label: "Wastage", color: "gray" },
//   lost: { label: "Lost", color: "black" },
//   found: { label: "Found", color: "white" },
// };

export default function DashboardPage() {
  const utils = api.useUtils();
  const { mutate: completeTaskItem } =
    api.task.allocations.complete.useMutation({
      onSuccess: async () => {
        await utils.task.allocations.list.invalidate();
      },
    });

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-row items-center justify-between">
        <Heading level={1}>WMS Dashboard</Heading>
        <div className="flex flex-row items-center">
          <Modal.Trigger>
            <Button variant="plain" color="primary">
              Record Receipt
            </Button>
            <Modal size="2xl" isDismissable>
              {({ close }) => (
                <PurchaseReceiptTaskForm onSave={close} onExit={close} />
              )}
            </Modal>
          </Modal.Trigger>
          <Modal.Trigger>
            <Button variant="plain" color="primary">
              Prepare Despatch
            </Button>
            <Modal size="2xl" isDismissable>
              {({ close }) => (
                <SalesDespatchTaskForm onSave={close} onExit={close} />
              )}
            </Modal>
          </Modal.Trigger>
          <Modal.Trigger>
            <Button variant="plain" color="primary">
              BOM Build
            </Button>
            <Modal size="4xl" isDismissable>
              {({ close }) => (
                <ProductionTaskForm onSave={close} onExit={close} />
              )}
            </Modal>
          </Modal.Trigger>
          <Modal.Trigger>
            <Button variant="plain" color="primary">
              Stock Transfer
            </Button>
            <Modal size="2xl" isDismissable>
              {({ close }) => (
                <StockTransferTaskForm onSave={close} onExit={close} />
              )}
            </Modal>
          </Modal.Trigger>
        </div>
      </div>
      <Divider />
      <Subheading level={2}>Tasks</Subheading>

      <DatatableQueryProvider
        endpoint={api.task.allocations.list}
        defaultInput={{
          filter: {
            isComplete: { eq: false },
          },
        }}
      >
        {(props) => (
          <Datatable {...props} aria-label="Tasks">
            <Datatable.Head>
              <Datatable.Column id="componentId" isSortable>
                Stock Code
              </Datatable.Column>
              <Datatable.Column id="batchReference" isSortable>
                Batch Reference
              </Datatable.Column>
              <Datatable.Column id="quantity" isSortable>
                Quantity
              </Datatable.Column>
              <Datatable.Column id="pickLocationName" isSortable>
                From Location
              </Datatable.Column>
              <Datatable.Column id="putLocationName" isSortable>
                To Location
              </Datatable.Column>
              <Datatable.Column id="actions">Actions</Datatable.Column>
            </Datatable.Head>
            <Datatable.Body
              data={props.data}
              emptyMessage="No open tasks remaining"
            >
              {({ data }) => (
                <Datatable.Row key={data.id}>
                  <Datatable.Cell id="componentId">
                    <TextLink href={`/components/${data.componentId}`}>
                      {data.componentId}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="batchReference">
                    {data.batchReference}
                  </Datatable.Cell>
                  <Datatable.DecimalCell
                    id="quantity"
                    value={data.quantity}
                    unit={data.componentUnit}
                  />
                  <Datatable.Cell id="pickLocationName">
                    {data.pickLocationName}
                  </Datatable.Cell>
                  <Datatable.Cell id="putLocationName">
                    {data.putLocationName}
                  </Datatable.Cell>
                  <Datatable.Cell id="actions">
                    <Button onPress={() => completeTaskItem({ id: data.id })}>
                      Mark Complete
                    </Button>
                  </Datatable.Cell>
                </Datatable.Row>
              )}
            </Datatable.Body>
          </Datatable>
        )}
      </DatatableQueryProvider>
      <Divider />
      <Subheading level={2}>Sage Discrepancies</Subheading>
      <DatatableQueryProvider
        endpoint={api.component.list}
        defaultInput={{
          filter: {
            sageDiscrepancy: { neq: 0 },
            isStockTracked: { eq: true },
          },
        }}
      >
        {(props) => (
          <Datatable {...props} aria-label="Sage Discrepancies">
            <Datatable.Head>
              <Datatable.Column id="id" isSortable>
                Stock Code
              </Datatable.Column>
              <Datatable.Column id="description" isSortable>
                Description
              </Datatable.Column>
              <Datatable.Column id="totalQuantity" isSortable>
                Total Quantity
              </Datatable.Column>
              <Datatable.Column id="sageQuantity" isSortable>
                Quantity In Sage
              </Datatable.Column>
              <Datatable.Column id="sageDiscrepancy" isSortable>
                Discrepancy
              </Datatable.Column>
            </Datatable.Head>
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={data.id}>
                  <Datatable.Cell id="id">
                    <TextLink
                      href={`/components/${encodeURIComponent(data.id)}`}
                    >
                      {data.id}
                    </TextLink>
                  </Datatable.Cell>
                  <Datatable.Cell id="description">
                    {data.description}
                  </Datatable.Cell>
                  <Datatable.DecimalCell
                    id="totalQuantity"
                    value={data.totalQuantity}
                    unit={data.unit}
                  />
                  <Datatable.DecimalCell
                    id="sageQuantity"
                    value={data.sageQuantity}
                    unit={data.unit}
                  />
                  <Datatable.DecimalCell
                    id="sageDiscrepancy"
                    value={data.sageDiscrepancy}
                    unit={data.unit}
                  />
                </Datatable.Row>
              )}
            </Datatable.Body>
          </Datatable>
        )}
      </DatatableQueryProvider>
    </div>
  );
}
