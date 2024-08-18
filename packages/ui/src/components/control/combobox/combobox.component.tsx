import type {
  ComboBoxProps as AriaComboBoxProps,
  ListBoxItemProps,
} from "react-aria-components";
import React from "react";
import { faChevronDown } from "@fortawesome/pro-light-svg-icons";
import {
  ComboBox as AriaComboBox,
  Group,
  ListBox,
} from "react-aria-components";

import {
  Input,
  ListboxItem,
  ListboxSection,
} from "@repo/ui/components/control";
import { Icon } from "@repo/ui/components/display";
import { Button } from "@repo/ui/components/element";
import { Popover } from "@repo/ui/components/utility";
import { cn } from "@repo/ui/lib/class-merge";

export interface ComboboxProps<T extends object>
  extends Omit<AriaComboBoxProps<T>, "children"> {
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Combobox<T extends object>({
  children,
  items,
  ...props
}: ComboboxProps<T>) {
  return (
    <AriaComboBox
      {...props}
      className={cn("group flex flex-row gap-1", props.className)}
    >
      <Group className="flex flex-row gap-1">
        <Input />
        <Button
          variant="ghost"
          size="icon"
          className="rounded mr-1 w-6 outline-offset-0"
        >
          <Icon icon={faChevronDown} aria-hidden className="h-4 w-4" />
        </Button>
      </Group>
      <Popover className="min-w-[--trigger-width]">
        <ListBox
          items={items}
          className="max-h-[inherit] overflow-auto p-1 outline-0"
        >
          {children}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}

export function ComboboxItem(props: ListBoxItemProps) {
  return <ListboxItem {...props} />;
}

export function ComboboxSection<T extends object>(
  props: ListboxSectionProps<T>,
) {
  return <ListboxSection {...props} />;
}
