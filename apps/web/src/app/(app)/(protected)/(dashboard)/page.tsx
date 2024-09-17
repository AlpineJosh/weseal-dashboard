"use client";

import { ProductionTaskForm } from "@/components/flows/ProductionTaskFlow";
import { PurchaseReceiptTaskForm } from "@/components/flows/PurchaseReceiptTask";
import { api } from "@/utils/trpc/react";

import { RouterInputs, RouterOutputs } from "@repo/api";
import { faBarsFilter, faFilterList, faSort } from "@repo/pro-solid-svg-icons";
import { Datatable, Table } from "@repo/ui/components/display";
import { Button, Icon, Menu } from "@repo/ui/components/element";
import { Card } from "@repo/ui/components/layout";
import { Link } from "@repo/ui/components/navigation";
import { Modal } from "@repo/ui/components/overlay";

// import { DataTable } from "@repo/ui/components/datatable/datatable";

// import { supabase } from "@/supabase/client";

export const runtime = "edge";

export default function HomePage() {
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
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="w-full border-b"></div>
      <h3 className="font-medium text-muted-foreground">Quick Actions</h3>
      <div className="flex flex-row items-stretch space-x-4">
        <Modal>
          <Button variant="primary">Record Receipt</Button>
          <Modal.Content isDismissable className="w-screen-md">
            <PurchaseReceiptTaskForm exit={close} />
          </Modal.Content>
        </Modal>
        <Button variant="primary">Prepare Despatch</Button>
        <Modal>
          <Button variant="primary">BOM Build</Button>
          <Modal.Content isDismissable>
            {({ close }) => <ProductionTaskForm close={close} />}
          </Modal.Content>
        </Modal>
        <Button variant="primary">Transfer</Button>
      </div>
      <div className="w-full border-b"></div>
      <h3 className="font-medium text-muted-foreground">Tasks</h3>

      <Card>
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
      </Card>
      <div className="w-full border-b"></div>
      <h3 className="font-medium text-muted-foreground">Sage Discrepancies</h3>

      <Card>
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
      </Card>
    </div>
  );
}
