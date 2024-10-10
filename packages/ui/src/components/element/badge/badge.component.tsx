"use client";

import type { ComponentPropsWithRef } from "react";
import React from "react";
import { cva } from "class-variance-authority";

import type { ColorVariants } from "../../../lib/colors";
import { cn } from "../../../lib/class-merge";
import { colorVariants } from "../../../lib/colors";

const variants = cva(
  [
    "inline-flex items-center gap-x-1.5 rounded-md px-1.5 py-0.5 text-sm font-medium",
    "bg-color/15 text-color-text group-data-[hover]:bg-color/25 dark:bg-color/25 forced-colors:outline",
  ],
  {
    variants: {
      color: colorVariants,
    },
    defaultVariants: {
      color: "default",
    },
  },
);

type BadgeProps = ComponentPropsWithRef<"span"> & { color?: ColorVariants };

const Badge = ({ color, className, ...props }: BadgeProps) => {
  return <span {...props} className={cn(className, variants({ color }))} />;
};

export { Badge };
export type { BadgeProps };
