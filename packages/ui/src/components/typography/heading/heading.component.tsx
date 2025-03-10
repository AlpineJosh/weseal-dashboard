"use client";

import type { ComponentPropsWithRef } from "react";
import { cx } from "@/utilities";

type HeadingProps = { level?: 1 | 2 | 3 | 4 | 5 | 6 } & ComponentPropsWithRef<
  "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
>;

const Heading = ({ className, level = 1, ...props }: HeadingProps) => {
  const Element: `h${typeof level}` = `h${level}`;

  return (
    <Element
      {...props}
      className={cx("text-content text-2xl/8 font-semibold", className)}
    />
  );
};

const Subheading = ({ className, level = 2, ...props }: HeadingProps) => {
  const Element: `h${typeof level}` = `h${level}`;

  return (
    <Element
      {...props}
      className={cx("text-content text-base font-semibold", className)}
    />
  );
};

export { Heading, Subheading };
export type { HeadingProps };
