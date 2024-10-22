"use client";

import type { ComponentPropsWithRef } from "react";
import React from "react";

import { cn } from "@repo/ui/lib/class-merge";

type HeadingProps = { level?: 1 | 2 | 3 | 4 | 5 | 6 } & ComponentPropsWithRef<
  "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
>;

const Heading = ({ className, level = 1, ...props }: HeadingProps) => {
  const Element: `h${typeof level}` = `h${level}`;

  return (
    <Element
      {...props}
      className={cn("text-2xl/8 font-semibold text-content", className)}
    />
  );
};

const Subheading = ({ className, level = 2, ...props }: HeadingProps) => {
  const Element: `h${typeof level}` = `h${level}`;

  return (
    <Element
      {...props}
      className={cn("text-base font-semibold text-content", className)}
    />
  );
};

export { Heading, Subheading };
export type { HeadingProps };
