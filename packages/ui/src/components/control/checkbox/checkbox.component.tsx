import type { CheckboxProps as AriaCheckboxProps } from "react-aria-components";
import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { Checkbox as AriaCheckbox } from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";
import { colorVariants } from "@repo/ui/lib/colors";

const variants = cva(
  [
    // Basic layout
    "relative isolate flex size-[1.125rem] items-center justify-center rounded-[0.3125rem] sm:size-4",
    // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
    "before:absolute before:inset-0 before:-z-10 before:rounded-[calc(0.3125rem-1px)] before:bg-background before:shadow",
    // Background color when checked
    "before:group-data-[selected]:bg-color",
    // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
    "dark:before:hidden",
    // Background color applied to control in dark mode
    "dark:bg-content/5 dark:group-data-[selected]:bg-color",
    // Border
    "group-data-[selected]:border-transparent group-data-[selected]:border-transparent group-data-[hovered]:border-transparent border border-content/15 group-data-[hovered]:border-content/30 group-data-[selected]:bg-color-border",
    // Inner highlight shadow
    "after:absolute after:inset-0 after:rounded-[calc(0.3125rem-1px)] after:shadow-[inset_0_1px_theme(colors.white/15%)]",
    "dark:after:-inset-px dark:after:hidden dark:after:rounded-[0.3125rem] dark:group-data-[selected]:after:block",
    // Focus ring
    "group-data-[focused]:outline group-data-[focused]:outline-2 group-data-[focused]:outline-offset-2 group-data-[focused]:outline-ring",
    // Disabled state
    "group-data-[disabled]:opacity-50",
    "group-data-[disabled]:before:bg-transparent group-data-[disabled]:text-background/5] group-data-[disabled]:text-background/25",
    "dark:group-data-[disabled]:border-white/20 dark:group-data-[disabled]:bg-white/[2.5%] dark:group-data-[disabled]:group-data-[selected]:after:hidden",
  ],
  {
    variants: {
      color: colorVariants,
    },
    defaultVariants: {
      color: "primary",
    },
  },
);

type CheckboxProps = VariantProps<typeof variants> & AriaCheckboxProps;

const Checkbox = ({ color, className, ...props }: CheckboxProps) => {
  return (
    <AriaCheckbox
      data-slot="control"
      {...props}
      className={cn(className, "group inline-flex focus:outline-none")}
    >
      <span className={variants({ color })}>
        <svg
          className="size-4 stroke-background opacity-0 group-data-[disabled]:stroke-background/50 group-data-[selected]:opacity-100 sm:h-3.5 sm:w-3.5"
          viewBox="0 0 14 14"
          fill="none"
        >
          {/* Checkmark icon */}
          <path
            className="opacity-100 group-data-[indeterminate]:opacity-0"
            d="M3 8L6 11L11 3.5"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Indeterminate icon */}
          <path
            className="opacity-0 group-data-[indeterminate]:opacity-100"
            d="M3 7H11"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </AriaCheckbox>
  );
};

export { Checkbox };
export type { CheckboxProps };
