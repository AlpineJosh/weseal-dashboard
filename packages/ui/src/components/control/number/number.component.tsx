"use client";

import { useEffect } from "react";
import { cva } from "class-variance-authority";
import { Decimal } from "decimal.js";
import { useImmer } from "use-immer";

import { cn } from "@repo/ui/lib/class-merge";

import type { Controllable } from "./use-controllable.hook";
import { useControllable } from "./use-controllable.hook";

const variants = {
  control: cva([
    "relative block w-full overflow-hidden",
    "before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-white before:shadow",
    "dark:before:hidden",
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent sm:after:focus-within:ring-2 sm:after:focus-within:ring-ring",
    "has-[[data-disabled]]:opacity-50 before:has-[[data-disabled]]:bg-content/5 before:has-[[data-disabled]]:shadow-none",
    "before:has-[[data-invalid]]:shadow-red-500/10",
  ]),
  input: cva(
    [
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
    ],
    {
      variants: {
        isDate: {
          true: [
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
        },
        isNumeric: {
          true: [
            "text-right tabular-nums",
            "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            "[&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0",
            "[-moz-appearance:_textfield]",
          ],
        },
      },
    },
  ),
};

export type NumberInputProps = Controllable<Decimal> & {
  className?: string;
};

export const NumberInput = ({
  className,
  value,
  onChange,
  defaultValue = new Decimal(0),
  ...props
}: NumberInputProps) => {
  const [controlledValue, setControlledValue] = useControllable<Decimal>({
    value,
    onChange,
    defaultValue,
  });

  const [rawInput, setRawInput] = useImmer<string>(controlledValue.toString());

  useEffect(() => {
    setRawInput(controlledValue.toString());
  }, [controlledValue, setRawInput]);

  return (
    <span data-slot="control" className={cn([variants.control(), className])}>
      <input
        {...props}
        type="text"
        value={rawInput}
        onChange={(event) => {
          const value = event.target.value;

          if (!/^-?\d*\.?\d*$/.test(value)) {
            return;
          }

          setRawInput(value);

          if (value.endsWith(".") || value.endsWith("0") || value === "-") {
            return;
          }

          if (value === "") {
            if (!controlledValue.eq(0)) {
              setControlledValue(new Decimal(0));
            }
          } else {
            setControlledValue(new Decimal(value));
          }
        }}
        className={variants.input({
          isNumeric: true,
        })}
      />
    </span>
  );
};
