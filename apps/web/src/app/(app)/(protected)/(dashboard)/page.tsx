"use client";

import { api } from "@/utils/trpc/react";

import { Table } from "@repo/ui/components/display";
import { Button } from "@repo/ui/components/element";
import { Card } from "@repo/ui/components/layout";

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

  const { data } = api.component.list.useQuery({
    filter: {
      discrepancy: true,
    },
  });

  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="w-full border-b"></div>
      <h3 className="font-medium text-muted-foreground">Quick Actions</h3>
      <div className="flex flex-row items-stretch space-x-4">
        <Button variant="primary">Record Receipt</Button>
        <Button variant="primary">Prepare Despatch</Button>
        <Button variant="primary">BOM Build</Button>
        <Button variant="primary">Transfer</Button>
      </div>

      <div className="w-full border-b"></div>
      <h3 className="font-medium text-muted-foreground">Sage Discrepancies</h3>
      {data && (
        <Card>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Component</Table.Head>
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
          </Table>
        </Card>
      )}
    </div>
    // <main className="container h-screen p-16">
    //   <div className="flex flex-col items-stretch justify-center gap-4">
    //     <DataTable
    //       columns={[
    //         {
    //           accessorKey: "id",
    //           header: "ID",
    //         },
    //         {
    //           accessorKey: "description",
    //           header: "Description",
    //         },
    //         {
    //           accessorKey: "category",
    //           header: "Category",
    //         },
    //         {
    //           accessorKey: "quantity",
    //           header: "Quantity",
    //         },
    //         {
    //           accessorKey: "allocated",
    //           header: "Quantity Allocated",
    //         },
    //         {
    //           accessorKey: "sageQuantity",
    //           header: "Quantity In Sage",
    //         },
    //       ]}
    //       data={data?.data ?? []}
    //     />
    //   </div>
    // </main>
  );
}
