"use client";

import type { ComponentPropsWithoutRef } from "react";
import React from "react";
import { Text as AriaText } from "react-aria-components";

import { Link } from "@repo/ui/components/element";
import { cn } from "@repo/ui/lib/class-merge";

type TextProps = ComponentPropsWithoutRef<"p">;

const Text = ({ className, ...props }: TextProps) => {
  return (
    <AriaText
      data-slot="text"
      {...props}
      className={cn(className, "text-base/6 text-content-muted sm:text-sm/6")}
    />
  );
};

type TextLinkProps = ComponentPropsWithoutRef<typeof Link>;

const TextLink = ({ className, ...props }: TextLinkProps) => {
  return (
    <Link
      {...props}
      className={cn(
        className,
        "text-content underline decoration-content/50 data-[hovered]:decoration-content",
      )}
    />
  );
};

type StrongProps = ComponentPropsWithoutRef<"strong">;

const Strong = ({ className, ...props }: StrongProps) => {
  return (
    <strong {...props} className={cn(className, "font-medium text-content")} />
  );
};

export { Text, TextLink, Strong };
export type { TextProps, TextLinkProps, StrongProps };
