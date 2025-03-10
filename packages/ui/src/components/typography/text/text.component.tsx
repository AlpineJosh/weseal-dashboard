"use client";

import type { ComponentPropsWithoutRef } from "react";
import { Link, LinkProps } from "@/components/utility";
import { cx } from "@/utilities";

type TextProps = ComponentPropsWithoutRef<"p">;

const Text = ({ className, ...props }: TextProps) => {
  return (
    <p
      data-slot="text"
      className={cx("text-content-muted text-base/6 sm:text-sm/6", className)}
      {...props}
    />
  );
};

type TextLinkProps = Omit<LinkProps, "as"> &
  Omit<ComponentPropsWithoutRef<"a">, "href">;

const TextLink = ({ className, ...props }: TextLinkProps) => {
  return (
    <Link
      {...props}
      className={cx(
        "text-content decoration-content/50 data-[hovered]:decoration-content font-medium underline",
        className,
      )}
    />
  );
};

type StrongProps = ComponentPropsWithoutRef<"strong">;

const Strong = ({ className, ...props }: StrongProps) => {
  return (
    <strong {...props} className={cx("text-content font-medium", className)} />
  );
};

export { Text, TextLink, Strong };
export type { TextProps, TextLinkProps, StrongProps };
