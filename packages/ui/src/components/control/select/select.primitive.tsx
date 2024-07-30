"use client";

import type { ButtonProps } from "@/components/button";
import type { IconProps } from "@/components/display/icon";
import type { PopoverProps } from "@/components/utilities/popover/popover.component";
import type {
  SelectProps as AriaSelectProps,
  ListBoxItemProps,
  SelectValueProps,
} from "react-aria-components";
import React, { forwardRef } from "react";
import { Button as ButtonPrimitive } from "@/components/button";
import { Icon } from "@/components/display/icon";
import { Popover as PopoverPrimitive } from "@/components/utilities/popover/popover.component";
import { cn } from "@/lib/class-merge";
import { cva } from "class-variance-authority";
import {
  Select as AriaSelect,
  SelectValue as AriaSelectValue,
  ListBox,
} from "react-aria-components";

import type {
  DropdownSectionProps,
  ListboxProps,
} from "../listbox/listbox.component";
import { DropdownItem, DropdownSection } from "../listbox/listbox.component";

const styles = cva(
  "dark:border-white/10 dark:bg-zinc-700 flex w-full min-w-[150px] cursor-default items-center gap-4 rounded-lg border py-2 pl-3 pr-2 text-start shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition dark:shadow-none",
  {
    variants: {
      isDisabled: {
        false:
          "pressed:bg-gray-200 dark:pressed:bg-zinc-500 text-gray-800 hover:bg-gray-100 group-invalid:border-red-600 dark:text-zinc-300 dark:hover:bg-zinc-600 forced-colors:group-invalid:border-[Mark]",
        true: "text-gray-200 dark:border-white/5 dark:bg-zinc-800 dark:text-zinc-600 forced-colors:border-[GrayText] forced-colors:text-[GrayText]",
      },
    },
  },
);

const Root = forwardRef(
  <T extends object>(
    { className, ...props }: AriaSelectProps<T>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    return (
      <AriaSelect
        ref={ref}
        {...props}
        className={cn("group flex flex-col gap-1", className)}
      />
    );
  },
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <ButtonPrimitive ref={ref} {...props} className={cn(styles, className)} />
    );
  },
);

const Value = forwardRef(
  <T extends object>(
    { className, ...props }: SelectValueProps<T>,
    ref: React.Ref<HTMLSpanElement>,
  ) => {
    return (
      <AriaSelectValue
        ref={ref}
        {...props}
        className={cn("flex-1 text-sm placeholder-shown:italic", className)}
      />
    );
  },
);

const Arrow = forwardRef<SVGSVGElement, IconProps>(
  ({ className, ...props }, ref) => {
    return <Icon ref={ref} {...props} className={cn("h-4 w-4", className)} />;
  },
);

const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  ({ className, ...props }, ref) => {
    return (
      <PopoverPrimitive
        ref={ref}
        {...props}
        className={cn("min-w-[--trigger-width]", className)}
      />
    );
  },
);

const Options = forwardRef(
  <T extends object>(
    { className, ...props }: ListboxProps<T>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    return (
      <ListBox
        ref={ref}
        {...props}
        className={cn(
          "max-h-[inherit] overflow-auto p-1 outline-none [clip-path:inset(0_0_0_0_round_.75rem)]",
          className,
        )}
      />
    );
  },
);

// const Option = forwardRef<HTMLLIElement, ListBoxItemProps>(
//   ({ className, ...props }, ref) => {
//     return <DropdownItem ref={ref} {...props} className={cn("", className)} />;
//   },
// );

// const Section = forwardRef(
//   <T extends object>(
//     { className, ...props }: DropdownSectionProps<T>,
//     ref: React.Ref<HTMLDivElement>,
//   ) => {
//     return (
//       <DropdownSection ref={ref} {...props} className={cn("", className)} />
//     );
//   },
// );

export default {
  Root,
  Button,
  Value,
  Arrow,
  Popover,
  Options,
  Option,
  Section,
};
