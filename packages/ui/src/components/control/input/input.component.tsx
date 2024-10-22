"use client";

import type { ComponentPropsWithRef } from "react";
import React, { forwardRef } from "react";
import * as Aria from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

const dateTypes = ["date", "datetime-local", "month", "time", "week"];
type DateType = (typeof dateTypes)[number];
type InputType =
  | "email"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "text"
  | "url"
  | DateType;

// type InputProps = ComponentPropsWithoutRef<"input">;

// const Input = forwardRef<HTMLInputElement, InputProps>(
//   ({ className, ...props }, ref) => {
//     return (
//       <InputPrimitive
//         className={cn(
//           "border-neutral-200 bg-transparent file:bg-transparent placeholder:text-neutral-500 focus-visible:ring-neutral-950 dark:border-neutral-800 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
//           className,
//         )}
//         ref={ref}
//         {...props}
//       />
//     );
//   },
// );
// Input.displayName = "Input";

// export { Input };
// export type { InputProps };

type InputGroupProps = ComponentPropsWithRef<"span">;

const InputGroup = ({ children }: InputGroupProps) => {
  return (
    <span
      data-slot="control"
      className={cn(
        "relative isolate block",
        "[&_input]:has-[[data-slot=icon]:first-child]:pl-10 [&_input]:has-[[data-slot=icon]:last-child]:pr-10 sm:[&_input]:has-[[data-slot=icon]:first-child]:pl-8 sm:[&_input]:has-[[data-slot=icon]:last-child]:pr-8",
        "[&>[data-slot=icon]]:pointer-events-none [&>[data-slot=icon]]:absolute [&>[data-slot=icon]]:top-3 [&>[data-slot=icon]]:z-10 [&>[data-slot=icon]]:size-5 sm:[&>[data-slot=icon]]:top-2.5 sm:[&>[data-slot=icon]]:size-4",
        "[&>[data-slot=icon]:first-child]:left-3 sm:[&>[data-slot=icon]:first-child]:left-2.5 [&>[data-slot=icon]:last-child]:right-3 sm:[&>[data-slot=icon]:last-child]:right-2.5",
        "[&>[data-slot=icon]]:text-content-muted",
      )}
    >
      {children}
    </span>
  );
};

export type InputProps = {
  type: InputType;
} & Omit<ComponentPropsWithRef<"input">, "type">;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        data-slot="control"
        className={cn([
          "relative block w-full",
          "before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-white before:shadow",
          "dark:before:hidden",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent sm:after:focus-within:ring-2 sm:after:focus-within:ring-ring",
          "has-[[data-disabled]]:opacity-50 before:has-[[data-disabled]]:bg-content/5 before:has-[[data-disabled]]:shadow-none",
          "before:has-[[data-invalid]]:shadow-red-500/10",
          className,
        ])}
      >
        <Aria.Input
          ref={ref}
          {...props}
          className={cn([
            // Date classes
            props.type &&
              dateTypes.includes(props.type) && [
                "[&::-webkit-datetime-edit-fields-wrapper]:p-0",
                "[&::-webkit-date-and-time-value]:min-h-[1.5em]",
                "[&::-webkit-datetime-edit]:inline-flex",
                "[&::-webkit-datetime-edit]:p-0",
                "[&::-webkit-datetime-edit-year-field]:p-0",
                "[&::-webkit-datetime-edit-month-field]:p-0",
                "[&::-webkit-datetime-edit-day-field]:p-0",
                "[&::-webkit-datetime-edit-hour-field]:p-0",
                "[&::-webkit-datetime-edit-minute-field]:p-0",
                "[&::-webkit-datetime-edit-second-field]:p-0",
                "[&::-webkit-datetime-edit-millisecond-field]:p-0",
                "[&::-webkit-datetime-edit-meridiem-field]:p-0",
              ],
            // Basic layout
            "relative block w-full appearance-none rounded-lg px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing[3])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)]",
            // Typography
            "text-base/6 text-content placeholder:text-content-muted sm:text-sm/6",
            // Border
            "border border-content/10 data-[hovered]:border-content/20",
            // Background color
            "bg-transparent dark:bg-white/5",
            // Hide default focus styles
            "focus:outline-none",
            // Invalid state
            "data-[invalid]:border-red-500 data-[invalid]:data-[hover]:border-red-500 data-[invalid]:dark:border-red-500 data-[invalid]:data-[hover]:dark:border-red-500",
            // Disabled state
            "data-[disabled]:border-content/20 dark:data-[hover]:data-[disabled]:border-white/15 data-[disabled]:dark:border-white/15 data-[disabled]:dark:bg-white/[2.5%]",
            // System icons
            "dark:[color-scheme:dark]",
          ])}
        />
      </span>
    );
  },
);
Input.displayName = "Input";
