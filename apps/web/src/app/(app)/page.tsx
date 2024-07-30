"use client";

import { DataTable } from "@repo/ui/components/datatable/datatable";

// import { supabase } from "~/supabase/client";
import { api } from "~/trpc/react";

export const runtime = "edge";

export default function HomePage() {
  // You can await this here if you don't want to show Suspense fallback below
  const { data } = api.component.all.useQuery({
    pagination: {
      page: 4,
      size: 20,
    },
    sort: [
      {
        field: "id",
        order: "asc",
      },
    ],
  });

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
    <main className="container h-screen p-16">
      <div className="flex flex-col items-stretch justify-center gap-4">
        <DataTable
          columns={[
            {
              accessorKey: "id",
              header: "ID",
            },
            {
              accessorKey: "description",
              header: "Description",
            },
            {
              accessorKey: "category",
              header: "Category",
            },
            {
              accessorKey: "quantity",
              header: "Quantity",
            },
            {
              accessorKey: "allocated",
              header: "Quantity Allocated",
            },
            {
              accessorKey: "sageQuantity",
              header: "Quantity In Sage",
            },

          ]}
          data={data?.data ?? []}
        />
      </div>
    </main>
  );
}
