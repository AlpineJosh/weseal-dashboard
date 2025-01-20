"use client";

import { cva } from "class-variance-authority";

import { cn } from "@repo/ui/lib/class-merge";

import type { ControlInputProps } from "../types";
import { Control } from "../../form";
import { useControllable } from "../../utility/hooks/useControllable.hook";

const variants = cva([
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
  "has-[:invalid]:border-red-500 has-[:invalid:hover]:border-red-500 has-[:invalid]:dark:border-red-500 has-[:invalid:hover]:dark:border-red-500",
  // Disabled state
  "has-[:disabled]:border-content/20 has-[:disabled]:dark:border-white/15 has-[:disabled]:dark:bg-white/[2.5%] dark:has-[:hover]:data-[disabled]:border-white/15",
  // System icons
  "dark:[color-scheme:dark]",
]);

export type TextInputProps = ControlInputProps<string> & {
  type?: "text" | "email" | "password" | "search" | "tel" | "url";
};

export const TextInput = ({
  value,
  onChange,
  defaultValue = "",
  type = "text",
  invalid,
  disabled,
  ...props
}: TextInputProps) => {
  const [controlledValue, setControlledValue] = useControllable({
    value,
    onChange,
    defaultValue,
  });
  return (
    <Control {...props}>
      <input
        type={type}
        value={controlledValue}
        onChange={(event) => setControlledValue(event.target.value)}
        disabled={disabled}
        aria-disabled={disabled}
        aria-invalid={invalid}
        className={cn(variants())}
      />
    </Control>
  );
};

TextInput.displayName = "TextInput";
