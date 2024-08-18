"use client";

import type { SeparatorProps } from "react-aria-components";
import { cva } from "class-variance-authority";
import { Separator as AriaSeparator } from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

const separatorVariants = cva(
  "bg-gray-300 dark:bg-zinc-600 forced-colors:bg-[ButtonBorder]",
  {
    variants: {
      orientation: {
        horizontal: "h-px w-full",
        vertical: "w-px",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

export function Separator({
  orientation,
  className,
  ...props
}: SeparatorProps) {
  return (
    <AriaSeparator
      {...props}
      className={cn(separatorVariants({ orientation }), className)}
    />
  );
}
