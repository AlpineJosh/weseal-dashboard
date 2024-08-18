"use client";

import { useState } from "react";
import { ComboboxItem } from "node_modules/@repo/ui/src/components/control/combobox/combobox.component";
import { useAsyncList } from "react-stately";

import { Combobox } from "@repo/ui/components/control";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";
import { Card } from "@repo/ui/components/layout";
import { Modal } from "@repo/ui/components/overlay";

// import { DataTable } from "@repo/ui/components/datatable/datatable";

// import { supabase } from "~/supabase/client";
import { api } from "~/trpc/react";

export const runtime = "edge";

export default function HomePage() {
  const [query, setQuery] = useState("");
  // You can await this here if you don't want to show Suspense fallback below
  const { data } = api.purchaseOrder.all.useQuery({ query });

  // const signInWithSSO = async () => {
  //   const { data } = await supabase.auth.signInWithSSO({
  //     domain: "weseal.com",
  //   });

  //   if (data) {
  //     window.location.href = data.url
  //   }
  // };

  console.log(data);
  return (
    <div>
      <Modal.Trigger>
        <Button>Log Delivery</Button>

        <Modal.Content isDismissable className="isolate p-8">
          <h1>Select Delivery</h1>
          <Form onSubmit={() => {}}>
            <Field.Root name="purchaseOrderId">
              <Field.Label>Delivery</Field.Label>
              <Field.Control>
                <Combobox
                  items={data?.data ?? []}
                  onInputChange={(value) => setQuery(value)}
                >
                  {(item) => (
                    <ComboboxItem id={item.id} textValue={item.id.toString()}>
                      {item.id}
                    </ComboboxItem>
                  )}
                </Combobox>
              </Field.Control>
            </Field.Root>
            <Button type="submit">Submit</Button>
          </Form>
        </Modal.Content>
      </Modal.Trigger>
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
