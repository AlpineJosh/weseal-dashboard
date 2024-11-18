"use client";

import { ProductionTaskForm } from "@/components/flows/ProductionTaskFlow";
import { PurchaseReceiptTaskForm } from "@/components/flows/PurchaseReceiptTask";
import { SalesDespatchTaskForm } from "@/components/flows/SalesDespatchTask";
import { StockTransferTaskForm } from "@/components/flows/StockTransferTask";
import { DatatableQueryProvider } from "@/utils/trpc/QueryProvider";
import { api } from "@/utils/trpc/react";

import { Datatable, Modal } from "@repo/ui/components/display";
import { Button, Divider } from "@repo/ui/components/element";
import { Heading, Subheading } from "@repo/ui/components/typography";

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
  // const utils = api.useUtils();
  // const { mutate: completeTaskItem } =
  //   api.inventory.tasks.items.complete.useMutation({
  //     onSuccess: async () => {
  //       await utils.inventory.tasks.items.list.invalidate();
  //     },
  //   });

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
        endpoint={api.inventory.tasks.items.list}
        defaultInput={{}}
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
            <Datatable.Body data={props.data}>
              {({ data }) => (
                <Datatable.Row key={data.id}>
                  <Datatable.Cell id="componentId">
                    {data.componentId}
                  </Datatable.Cell>
                  <Datatable.Cell id="batchReference">
                    {data.batchReference}
                  </Datatable.Cell>
                  <Datatable.Cell id="quantity">{data.quantity}</Datatable.Cell>
                  <Datatable.Cell id="pickLocationName">
                    {data.pickLocationName}
                  </Datatable.Cell>
                  <Datatable.Cell id="putLocationName">
                    {data.putLocationName}
                  </Datatable.Cell>
                  <Datatable.Cell id="actions">
                    <Button>Mark Complete</Button>
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
        defaultInput={{ filter: { sageDiscrepancy: { neq: 0 } } }}
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
                  <Datatable.Cell id="id">{data.id}</Datatable.Cell>
                  <Datatable.Cell id="description">
                    {data.description}
                  </Datatable.Cell>
                  <Datatable.Cell id="totalQuantity">
                    {data.totalQuantity}
                  </Datatable.Cell>
                  <Datatable.Cell id="sageQuantity">
                    {data.sageQuantity}
                  </Datatable.Cell>
                  <Datatable.Cell id="sageDiscrepancy">
                    {data.sageDiscrepancy}
                  </Datatable.Cell>
                </Datatable.Row>
              )}
            </Datatable.Body>
          </Datatable>
        )}
      </DatatableQueryProvider>
    </div>
  );
}
