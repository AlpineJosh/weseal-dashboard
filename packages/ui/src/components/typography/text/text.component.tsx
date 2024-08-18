"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { Text as AriaText } from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

const textStyles = cva("leading-7 [&:not(:first-child)]:mt-6", {
  variants: {
    muted: {
      true: "text-muted-foreground",
    },
  },
});

interface TextProps extends ComponentPropsWithoutRef<"p"> {
  muted?: boolean;
}

const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ muted = false, className, ...props }, ref) => {
    return (
      <AriaText
        className={cn(textStyles({ muted }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);

export { Text };
export type { TextProps };
