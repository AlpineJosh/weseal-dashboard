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

import type { ControlRenderProps } from "../../form/field/field.component";

const variants = {
  root: cva(),
  button: cva([
    "group relative block w-full",
    "before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-white before:shadow",
    "dark:before:hidden",
    "focus:outline-none",
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent after:data-[focus]:ring-2 after:data-[focus]:ring-ring",
    "data-[disabled]:opacity-50 before:data-[disabled]:bg-content/5 before:data-[disabled]:shadow-none",
  ]),
  value: cva([
    "relative block w-full appearance-none rounded-lg py-[calc(theme(spacing[2.5])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)]",
    "min-h-11 sm:min-h-9",
    "pl-[calc(theme(spacing[3.5])-1px)] pr-[calc(theme(spacing.7)-1px)] sm:pl-[calc(theme(spacing.3)-1px)]",
    "text-left text-base/6 text-content data-[placeholder]:text-content-muted sm:text-sm/6 forced-colors:text-[CanvasText]",
    "border border-content/10 group-data-[active]:border-content/20 group-data-[hovered]:border-content/20",
    "bg-transparent dark:bg-white/5",
    "group-data-[invalid]:border-red-500 group-data-[invalid]:group-data-[hovered]:border-red-500 group-data-[invalid]:dark:border-red-600 group-data-[invalid]:data-[hovered]:dark:border-red-600",
    "group-data-[disabled]:border-content/20 group-data-[disabled]:opacity-100 group-data-[disabled]:dark:bg-white/[2.5%] dark:data-[hovered]:group-data-[disabled]:border-white/15",
  ]),
  icon: cva([
    "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2",
  ]),
};

type SelectProps<T extends object> = Omit<
  Aria.SelectProps<T>,
  "children" | "onSelectionChange" | "selectedKey"
> &
  Partial<ControlRenderProps<Aria.Key>> & {
    items?: T[];
    children: React.ReactNode | ((item: T) => React.ReactNode);
  };

const Root = <T extends object>({
  children,
  items,
  className,
  onChange,
  value,
  ...props
}: SelectProps<T>) => {
  return (
    <Aria.Select
      {...props}
      onSelectionChange={onChange}
      selectedKey={value}
      className={cn(variants.root(), className)}
    >
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
      <Popover className="min-w-[--trigger-width]">
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
