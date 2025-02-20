"use client";

import { api } from "@/utils/trpc/react";

import { Button } from "@repo/ui/components/element";

export default function AdminPage() {
  // const { mutate: resetInventory } = api.inventory.reset.useMutation();
  const { mutate: reset } = api.inventory.reset.useMutation();
  return (
    <div>
      <Button
        onPress={() => {
          // resetInventory({ componentId: "BOPZ056WH0280SQM" });
          // resetInventory({ componentId: "WS051OR2800SQMEB090" });
          // resetInventory({ componentId: "WS051OR012003000EB090" });
          // resetInventory({ componentId: "OL175GR006000050B" });
          // resetInventory({ componentId: "BOP020CL4950SQM" });
          // resetInventory({ componentId: "SV055DGN071SQM" });
          // resetInventory({ componentId: "CARRIAGECHARGE" });
          reset();
        }}
      >
        Reset Inventory
      </Button>
    </div>
  );
}
