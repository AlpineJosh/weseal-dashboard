import React from "react";
import { cva } from "class-variance-authority";
import * as Aria from "react-aria-components";

import type {
  ListboxOptionProps,
  ListboxSectionProps,
} from "@repo/ui/components/control";
import { faAnglesUpDown } from "@repo/pro-light-svg-icons";
import { Listbox } from "@repo/ui/components/control";
import { Icon } from "@repo/ui/components/element";
import { Popover } from "@repo/ui/components/utility";
import { cn } from "@repo/ui/lib/class-merge";

const variants = {
  root: cva(),
  button: cva([
    // Basic layout
    "group relative block w-full",
    // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
    "before:bg-white before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:shadow",
    // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
    "dark:before:hidden",
    // Hide default focus styles
    "focus:outline-none",
    // Focus ring
    "after:ring-transparent after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:data-[focus]:ring-2 after:data-[focus]:ring-ring",
    // Disabled state
    "data-[disabled]:opacity-50 before:data-[disabled]:bg-content/5 before:data-[disabled]:shadow-none",
  ]),
  value: cva([
    // Basic layout
    "relative block w-full appearance-none rounded-lg py-[calc(theme(spacing[2.5])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)]",
    // Set minimum height for when no value is selected
    "min-h-11 sm:min-h-9",
    // Horizontal padding
    "pl-[calc(theme(spacing[3.5])-1px)] pr-[calc(theme(spacing.7)-1px)] sm:pl-[calc(theme(spacing.3)-1px)]",
    // Typography
    "text-left text-base/6 text-content data-[placeholder]:text-content-muted sm:text-sm/6 forced-colors:text-[CanvasText]",
    // Border
    "border border-content/10 group-data-[active]:border-content/20 group-data-[hovered]:border-content/20",
    // Background color
    "bg-transparent dark:bg-white/5",
    // Invalid state
    "group-data-[invalid]:border-red-500 group-data-[invalid]:group-data-[hovered]:border-red-500 group-data-[invalid]:dark:border-red-600 group-data-[invalid]:data-[hovered]:dark:border-red-600",
    // Disabled state
    "group-data-[disabled]:dark:bg-white/[2.5%] dark:data-[hovered]:group-data-[disabled]:border-white/15 group-data-[disabled]:border-content/20 group-data-[disabled]:opacity-100",
  ]),
  icon: cva([
    "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2",
  ]),
  popover: cva([
    // "[--anchor-offset:-1.625rem] [--anchor-padding:theme(spacing.4)] sm:[--anchor-offset:-1.375rem]",
    // // Base styles
    // "rounded-xl isolate w-max min-w-[calc(var(--button-width)+1.75rem)] select-none scroll-py-1 p-1",
    // // Invisible border that is only visible in `forced-colors` mode for accessibility purposes
    // "outline-transparent outline outline-1 focus:outline-none",
    // // Handle scrolling when menu won't fit in viewport
    // "overflow-y-scroll overscroll-contain",
    // // Popover background
    // "bg-popover/75 backdrop-blur-xl",
    // // Shadows
    // "shadow-lg ring-1 ring-content/10 dark:ring-inset",
    // // Transitions
    // "transition-opacity duration-100 ease-in data-[transition]:pointer-events-none data-[closed]:data-[leave]:opacity-0",
  ]),
  listbox: cva([
    // "[--anchor-offset:-1.625rem] [--anchor-padding:theme(spacing.4)] sm:[--anchor-offset:-1.375rem]",
    // // Base styles
    // "rounded-xl isolate w-max min-w-[calc(var(--button-width)+1.75rem)] select-none scroll-py-1 p-1",
    // // Invisible border that is only visible in `forced-colors` mode for accessibility purposes
    // "outline-transparent outline outline-1 focus:outline-none",
    // // Handle scrolling when menu won't fit in viewport
    // "overflow-y-scroll overscroll-contain",
    // // Popover background
    // "bg-popover/75 backdrop-blur-xl",
    // // Shadows
    // "shadow-lg ring-1 ring-content/10 dark:ring-inset",
    // // Transitions
    // "transition-opacity duration-100 ease-in data-[transition]:pointer-events-none data-[closed]:data-[leave]:opacity-0",
  ]),
};

const styles = cva(
  cn(
    "border-input flex w-full min-w-[150px] cursor-default items-center gap-4 rounded-lg border py-2 pl-3 pr-2 text-start transition",
    "focus:outline-none rac-focus-visible:outline-2 rac-focus-visible:outline-ring",
  ),

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

type SelectProps<T extends object> = Omit<Aria.SelectProps<T>, "children"> & {
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
};

const Root = <T extends object>({
  children,
  items,
  className,
  ...props
}: SelectProps<T>) => {
  return (
    <Aria.Select {...props} className={cn(variants.root(), className)}>
      <Aria.Button data-slot="control" className={variants.button()}>
        <Aria.SelectValue className={variants.value()} />
        <span className={variants.icon()}>
          <Icon
            icon={faAnglesUpDown}
            aria-hidden
            className="size-3 stroke-content-muted group-data-[disabled]:stroke-content/20 sm:size-3"
          />
        </span>
      </Aria.Button>
      <Popover className={variants.popover()}>
        <Listbox
          items={items}
          className="max-h-[inherit] overflow-auto p-1 outline-none [clip-path:inset(0_0_0_0_round_.75rem)]"
        >
          {children}
        </Listbox>
      </Popover>
    </Aria.Select>
  );
};

const Option = <T extends object>(props: ListboxOptionProps<T>) => {
  return <Listbox.Option {...props} />;
};

const Section = <T extends object>(props: ListboxSectionProps<T>) => {
  return <Listbox.Section {...props} />;
};

export const Select = Object.assign(Root, {
  Option,
  Section,
});

export type { SelectProps };
