"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

import { cn } from "@repo/ui/lib/class-merge";

export type CardProps = {
  children: React.ReactNode;
};

export const Card = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & CardProps
>((props, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className={cn("rounded-lg bg-card shadow", props.className)}
    />
  );
});
