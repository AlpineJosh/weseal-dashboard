"use client";

import type { ComponentPropsWithoutRef } from "react";
import type { HeadingProps as AriaHeadingProps } from "react-aria-components";
import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { Heading as AriaHeading } from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

const headingStyles = cva("", {
  variants: {
    muted: {
      true: "text-muted-foreground",
    },
    level: {
      1: "text-4xl font-bold",
      2: "text-3xl font-bold",
      3: "text-2xl font-bold",
      4: "text-xl font-bold",
      5: "text-lg font-bold",
      6: "text-base font-bold",
    },
  },
});

interface HeadingProps extends AriaHeadingProps {
  muted?: boolean;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 3, muted = false, ...props }, ref) => {
    return (
      <AriaHeading
        ref={ref}
        className={cn(headingStyles({ level, muted }), className)}
        {...props}
      />
    );
  },
);

export { Heading };
export type { HeadingProps };
