import type { ColorVariants } from "@repo/ui/lib/colors";
import { Badge } from "@repo/ui/components/element";

interface LedgerDetail {
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

export const LedgerDetails: Record<LedgerDetail["type"], LedgerDetail> = {
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

export const Ledger = {
  Badge: ({ type }: { type: string }) => {
    let badge = <Badge color="default">{type}</Badge>;

    if (type in LedgerDetails) {
      const entry = LedgerDetails[type as LedgerDetail["type"]];
      badge = <Badge color={entry.color}>{entry.label}</Badge>;
    }
    return badge;
  },
};
