import type { DropdownSectionProps } from "@/components/control";
import type {
  ComboBoxProps as AriaComboBoxProps,
  ListBoxItemProps,
} from "react-aria-components";
import React from "react";
import { Button } from "@/components/button";
import { DropdownItem, DropdownSection, Input } from "@/components/control";
import { Icon } from "@/components/display";
import { Popover } from "@/components/utilities";
import { cn } from "@/lib/class-merge";
import { faChevronDown } from "@fortawesome/pro-light-svg-icons";
import {
  ComboBox as AriaComboBox,
  Group,
  ListBox,
} from "react-aria-components";

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
  return <DropdownItem {...props} />;
}

export function ComboboxSection<T extends object>(
  props: DropdownSectionProps<T>,
) {
  return <DropdownSection {...props} />;
}
