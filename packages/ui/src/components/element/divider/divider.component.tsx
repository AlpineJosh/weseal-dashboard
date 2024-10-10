"use client";

import type { SeparatorProps } from "react-aria-components";
import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { Separator as AriaSeparator } from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

const variants = cva("", {
  variants: {
    orientation: {
      horizontal: "h-0 w-full border-t",
      vertical: "w-0 border-l",
    },
    soft: {
      true: "border-content/5",
      false: "border-content/10",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    soft: false,
  },
});

type DividerProps = SeparatorProps & VariantProps<typeof variants>;

const Divider = ({ orientation, className, soft, ...props }: DividerProps) => {
  return (
    <AriaSeparator
      {...props}
      className={cn(variants({ orientation, soft }), className)}
    />
  );
};

export { Divider };
export type { DividerProps };
