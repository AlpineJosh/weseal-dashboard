"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { Input as InputPrimitive } from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

type InputProps = ComponentPropsWithoutRef<"input">;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <InputPrimitive
        className={cn(
          "border-neutral-200 bg-transparent file:bg-transparent placeholder:text-neutral-500 focus-visible:ring-neutral-950 dark:border-neutral-800 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
export type { InputProps };
