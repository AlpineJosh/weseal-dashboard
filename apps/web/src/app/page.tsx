"use client";

import { api } from "~/trpc/react";

export const runtime = "edge";

export default function HomePage() {
  // You can await this here if you don't want to show Suspense fallback below
  const { data } = api.component.all.useQuery();
  console.log(data)
  return (
      <main className="container h-screen py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            {data?.map((component) => (
              <div key={component.id}>{component.id}</div>
            ))}
          </h1>
        </div>
      </main>
  );
}