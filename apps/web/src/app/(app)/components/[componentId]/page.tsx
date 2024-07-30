"use client";

import { useParams } from "next/navigation";




export default function ComponentDetailPage() {
  const { componentId } = useParams<{ componentId: string }>();

  console.log(componentId)

  return (
    <div>
      <h1>ComponentDetailPage</h1>
    </div>
  );
}
