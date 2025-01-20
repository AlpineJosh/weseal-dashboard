import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "@repo/ui/lib/class-merge";

const variants = cva(
  ["animate-spin rounded-full border-2", "border-content/10 border-t-content"],
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-6",
        lg: "size-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface SpinnerProps extends VariantProps<typeof variants> {
  className?: string;
}

export const Spinner = ({ size, className }: SpinnerProps) => {
  return (
    <div
      className={cn(variants({ size }), className)}
      role="status"
      aria-label="Loading"
    />
  );
};
