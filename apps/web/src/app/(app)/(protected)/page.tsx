"use client";

import { ProductionTaskForm } from "@/components/flows/ProductionTaskFlow";
import { PurchaseReceiptTaskForm } from "@/components/flows/PurchaseReceiptTask";
import { SalesDespatchTaskForm } from "@/components/flows/SalesDespatchTask";
import { StockTransferTaskForm } from "@/components/flows/StockTransferTask";
import { api } from "@/utils/trpc/react";

import { RouterInputs, RouterOutputs } from "@repo/api";
import { faBarsFilter, faFilterList, faSort } from "@repo/pro-solid-svg-icons";
import { Datatable, Modal, Table } from "@repo/ui/components/display";
import { Button, Divider, Icon, Menu } from "@repo/ui/components/element";
import { Link } from "@repo/ui/components/navigation";
import { Heading, Subheading } from "@repo/ui/components/typography";

// import { DataTable } from "@repo/ui/components/datatable/datatable";

// import { supabase } from "@/supabase/client";

export const runtime = "edge";

const taskColumns = [
  {
    name: "ID",
    id: "id",
    isRowHeader: true,
  },
  {
    name: "Type",
    id: "type",
  },
  {
    name: "Items",
    id: "items",
  },
  {
    name: "Created At",
    id: "createdAt",
  },
];

export default function DashboardPage() {
  // You can await this here if you don't want to show Suspense fallback below
  // const { data } = api.purchaseOrder.all.useQuery({ query });

  // const signInWithSSO = async () => {
  //   const { data } = await supabase.auth.signInWithSSO({
  //     domain: "weseal.com",
  //   });

  //   if (data) {
  //     window.location.href = data.url
  //   }
  // };

  // console.log(data);

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
            <Modal size="2xl" isDismissable>
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

      {/* <Datatable data={api.task.list.useQuery}>
        <Datatable.Controls>
          <Datatable.Search />
          <Datatable.Filters />
        </Datatable.Controls>
        <Datatable.Table>
          <Datatable.Column label="ID">
            {(item) => <Datatable.Cell>{item.id}</Datatable.Cell>}
          </Datatable.Column>
          <Datatable.Column label="Type">
            {(item) => <Datatable.Cell>{item.type}</Datatable.Cell>}
          </Datatable.Column>
          <Datatable.Column label="Items">
            {(item) => <Datatable.Cell>{item.items.length}</Datatable.Cell>}
          </Datatable.Column>
          <Datatable.Column label="Created At">
            {(item) => (
              <Datatable.Cell>
                {item.createdAt.toLocaleDateString()}
              </Datatable.Cell>
            )}
          </Datatable.Column>
        </Datatable.Table>
      </Datatable> */}

      <Datatable<RouterOutputs["task"]["list"]["rows"][number]>
        columns={[
          {
            accessor: "id",
            label: "ID",
            cell: (row) => {
              return (
                <Table.Cell>
                  <Link href={`/tasks/${row.id}`}>{row.id}</Link>
                </Table.Cell>
              );
            },
          },
          {
            accessor: "type",
            label: "Type",
          },
          {
            accessor: (row) => row.items.length,
            label: "Items",
          },
          {
            accessor: (row) => row.createdAt.toLocaleDateString(),
            label: "Created At",
          },
        ]}
        data={api.task.list.useQuery}
      />
      <Divider />
      <Subheading level={2}>Sage Discrepancies</Subheading>
      {/* <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>
                  Component
                  <Menu variant="ghost" icon={faFilterList}>
                    <Menu.Item>Sort Ascending</Menu.Item>
                    <Menu.Item>Sort Descending</Menu.Item>
                  </Menu>
                </Table.Head>
                <Table.Head>Description</Table.Head>
                <Table.Head>Total Quantity</Table.Head>
                <Table.Head>Sage Quantity</Table.Head>
                <Table.Head>Discrepancy</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.map((component) => (
                <Table.Row key={component.id}>
                  <Table.Cell>{component.id}</Table.Cell>
                  <Table.Cell>{component.description}</Table.Cell>
                  <Table.Cell>{component.totalQuantity}</Table.Cell>
                  <Table.Cell>{component.sageQuantity}</Table.Cell>
                  <Table.Cell>{component.sageDiscrepancy}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table> */}
      <Datatable<RouterOutputs["component"]["list"]["rows"][number]>
        columns={[
          {
            accessor: "id",
            label: "ID",
          },
          {
            accessor: "description",
            label: "Description",
          },
          {
            accessor: (row) => row.category?.name,
            label: "Category",
          },
          {
            accessor: "totalQuantity",
            label: "Quantity",
          },
          {
            accessor: "sageQuantity",
            label: "Quantity In Sage",
          },
          {
            accessor: "sageDiscrepancy",
            label: "Discrepancy",
          },
        ]}
        data={api.component.list.useQuery}
        filter={{ sageDiscrepancy: { neq: 0 } }}
      />
    </div>
  );
}
