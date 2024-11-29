"use client";

import { api } from "@/utils/trpc/react";

import { Button } from "@repo/ui/components/element";

export default function AdminPage() {
  const { mutate: resetInventory } = api.inventory.resetInventory.useMutation();

  return (
    <div>
      <Button onPress={() => resetInventory()}>Reset Inventory</Button>
    </div>
  );
}
