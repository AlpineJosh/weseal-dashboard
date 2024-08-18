import type {
  SelectProps as AriaSelectProps,
  ListBoxItemProps,
} from "react-aria-components";
import React from "react";
import { faChevronDown } from "@fortawesome/pro-light-svg-icons";
import { cva } from "class-variance-authority";
import {
  Select as AriaSelect,
  Button,
  ListBox,
  SelectValue,
} from "react-aria-components";

import type { ListboxSectionProps } from "@repo/ui/components/control";
import { ListboxItem, ListboxSection } from "@repo/ui/components/control";
import { Icon } from "@repo/ui/components/element";
import { Popover } from "@repo/ui/components/utility";
import { cn } from "@repo/ui/lib/class-merge";

const styles = cva(
  cn(
    "flex w-full min-w-[150px] cursor-default items-center gap-4 rounded-lg border border-input py-2 pl-3 pr-2 text-start transition",
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

export interface SelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, "children"> {
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<T extends object>({
  children,
  items,
  className,
  ...props
}: SelectProps<T>) {
  return (
    <AriaSelect
      {...props}
      className={cn("group flex flex-col gap-1", className)}
    >
      <Button className={styles}>
        <SelectValue className="flex-1 text-sm placeholder-shown:italic" />
        <Icon
          icon={faChevronDown}
          aria-hidden
          className="text-gray-600 group-disabled:text-gray-200 dark:text-zinc-400 dark:group-disabled:text-zinc-600 h-4 w-4 forced-colors:text-[ButtonText] forced-colors:group-disabled:text-[GrayText]"
        />
      </Button>
      <Popover className="min-w-[--trigger-width]">
        <ListBox
          items={items}
          className="max-h-[inherit] overflow-auto p-1 outline-none [clip-path:inset(0_0_0_0_round_.75rem)]"
        >
          {children}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

export function SelectItem(props: ListBoxItemProps) {
  return <ListboxItem variant="dropdown" {...props} />;
}

export function SelectSection<T extends object>(props: ListboxSectionProps<T>) {
  return <ListboxSection {...props} />;
}
