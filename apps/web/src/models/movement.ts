import type { ColorVariants } from "@repo/ui/lib/colors";

interface MovementType {
  type:
    | "production"
    | "despatch"
    | "receipt"
    | "transfer"
    | "correction"
    | "wastage"
    | "lost"
    | "found";
  label: string;
  color: ColorVariants;
}

export const movementType: Record<MovementType["type"], MovementType> = {
  receipt: {
    type: "receipt",
    label: "Receipt",
    color: "green",
  },
  despatch: {
    type: "despatch",
    label: "Despatch",
    color: "red",
  },
  production: {
    type: "production",
    label: "Production",
    color: "blue",
  },
  transfer: {
    type: "transfer",
    label: "Transfer",
    color: "yellow",
  },
  correction: {
    type: "correction",
    label: "Correction",
    color: "teal",
  },
  wastage: {
    type: "wastage",
    label: "Wastage",
    color: "pink",
  },
  lost: {
    type: "lost",
    label: "Lost",
    color: "rose",
  },
  found: {
    type: "found",
    label: "Found",
    color: "emerald",
  },
};
