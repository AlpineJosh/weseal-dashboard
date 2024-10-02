"use client";

import React, { ComponentPropsWithRef } from "react";

import { cn } from "@repo/ui/lib/class-merge";

type HeadingProps = { level?: 1 | 2 | 3 | 4 | 5 | 6 } & ComponentPropsWithRef<
  "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
>;

const Heading = ({ className, level = 1, ...props }: HeadingProps) => {
  let Element: `h${typeof level}` = `h${level}`;

  return (
    <Element
      {...props}
      className={cn(className, "text-2xl/8 font-semibold text-content")}
    />
  );
};

const Subheading = ({ className, level = 2, ...props }: HeadingProps) => {
  let Element: `h${typeof level}` = `h${level}`;

  return (
    <Element
      {...props}
      className={cn(className, "text-base font-semibold text-content")}
    />
  );
};

export { Heading, Subheading };
export type { HeadingProps };
