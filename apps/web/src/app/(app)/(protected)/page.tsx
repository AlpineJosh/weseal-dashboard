"use client";

import { ProductionTaskForm } from "@/components/flows/ProductionTaskFlow";
import { PurchaseReceiptTaskForm } from "@/components/flows/PurchaseReceiptTask";
import { SalesDespatchTaskForm } from "@/components/flows/SalesDespatchTask";
import { StockTransferTaskForm } from "@/components/flows/StockTransferTask";
import { api } from "@/utils/trpc/react";

import { RouterInputs, RouterOutputs } from "@repo/api";
import { faBarsFilter, faFilterList, faSort } from "@repo/pro-solid-svg-icons";
import { Datatable, Modal, Table } from "@repo/ui/components/display";
import {
  Badge,
  Button,
  Divider,
  Icon,
  Menu,
} from "@repo/ui/components/element";
import { Link } from "@repo/ui/components/navigation";
import { Heading, Subheading } from "@repo/ui/components/typography";

// import { DataTable } from "@repo/ui/components/datatable/datatable";

// import { supabase } from "@/supabase/client";

export const runtime = "edge";

const taskTypes = {
  receipt: { label: "Receipt", color: "green" },
  despatch: { label: "Despatch", color: "red" },
  production: { label: "Production", color: "blue" },
  transfer: { label: "Transfer", color: "yellow" },
  correction: { label: "Correction", color: "purple" },
  wastage: { label: "Wastage", color: "gray" },
  lost: { label: "Lost", color: "black" },
  found: { label: "Found", color: "white" },
};

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

      <Datatable
        columns={[
          {
            id: "id",
            key: "id",
            isRowHeader: true,
            label: "ID",
            cell: (row) => {
              return (
                <Datatable.Cell>
                  <Link href={`/tasks/${row.id}`}>{row.id}</Link>
                </Datatable.Cell>
              );
            },
          },
          {
            id: "type",
            key: "type",
            label: "Type",
            cell: (row) => {
              return (
                <Datatable.Cell>
                  <Badge color={taskTypes[row.type].color}>
                    {taskTypes[row.type].label}
                  </Badge>
                </Datatable.Cell>
              );
            },
          },
          {
            id: "status",
            key: "items",
            label: "Status",
            cell: (row) => {
              return (
                <Datatable.Cell>
                  {row.items.length > 0 ? (
                    <Badge color="rose">In Progress</Badge>
                  ) : (
                    <Badge color="green">Complete</Badge>
                  )}
                </Datatable.Cell>
              );
            },
          },
          {
            id: "items",
            key: "items",
            label: "Items",
            cell: (row) => {
              return <Datatable.Cell>{row.items.length}</Datatable.Cell>;
            },
          },
          {
            id: "createdAt",
            key: "createdAt",
            label: "Created At",
            cell: (row) => {
              return (
                <Datatable.Cell>
                  {row.createdAt.toLocaleDateString()}
                </Datatable.Cell>
              );
            },
          },
        ]}
        data={(query) =>
          api.task.list.useQuery({
            ...query,
          })
        }
      />
      <Divider />
      <Subheading level={2}>Sage Discrepancies</Subheading>

      <Datatable
        columns={[
          {
            id: "id",
            isRowHeader: true,
            key: "id",
            label: "Stock Code",
            cell: (row) => {
              return <Datatable.Cell>{row.id}</Datatable.Cell>;
            },
          },
          {
            id: "description",
            key: "description",
            label: "Description",
            cell: (row) => {
              return <Datatable.Cell>{row.description}</Datatable.Cell>;
            },
          },
          // {
          //   id: "category",
          //   key: "category",
          //   label: "Category",
          //   cell: (row) => {
          //     return <Table.Cell>{row.category?.name}</Table.Cell>;
          //   },
          // },
          {
            id: "totalQuantity",
            key: "totalQuantity",
            label: "Total Quantity",
            cell: (row) => {
              return <Datatable.Cell>{row.totalQuantity}</Datatable.Cell>;
            },
          },
          {
            id: "sageQuantity",
            key: "sageQuantity",
            label: "Quantity In Sage",
            cell: (row) => {
              return <Datatable.Cell>{row.sageQuantity}</Datatable.Cell>;
            },
          },
          {
            id: "sageDiscrepancy",
            key: "sageDiscrepancy",
            label: "Discrepancy",
            cell: (row) => {
              return <Datatable.Cell>{row.sageDiscrepancy}</Datatable.Cell>;
            },
          },
        ]}
        data={(query) => {
          console.log(query.pagination?.page);
          const { data, isLoading, error } = api.component.list.useQuery({
            ...query,
            filter: {
              sageDiscrepancy: {
                neq: 0,
              },
            },
          });
          console.log(data);
          return {
            data,
            isLoading,
            error,
          };
        }}
      />
    </div>
  );
}
