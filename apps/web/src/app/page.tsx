"use client";

import { supabase } from "~/supabase/client";
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

  const signInWithSSO = async () => {
    const { data } = await supabase.auth.signInWithSSO({
      domain: "weseal.com",
    });

    if (data) {
      window.location.href = data.url
    }
  };


  console.log(data)
  return (
      <main className="container h-screen py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <button onClick={signInWithSSO}>Login</button>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((component) => (
                <tr key={component.id}>
                  <td>{component.id}</td>
                  <td>{component.description}</td>
                  <td>{component.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
  );
}