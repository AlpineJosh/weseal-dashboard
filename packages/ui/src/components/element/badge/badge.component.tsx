"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@repo/ui/lib/class-merge";

const badgeVariants = cva(
  "rounded-full inline-flex items-center px-2 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary-muted text-primary",
        secondary: "bg-secondary-muted text-secondary",
        accent: "bg-accent-muted text-accent",
        outline: "border bg-background text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & BadgeProps
>(({ variant, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
});

export { Badge };
