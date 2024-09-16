"use client";

import type {
  ComboBoxProps as AriaComboBoxProps,
  ListBoxItemProps,
} from "react-aria-components";
import {
  ComboBox as AriaComboBox,
  Group,
  ListBox,
} from "react-aria-components";
import { useImmer } from "use-immer";

import { faChevronDown } from "@repo/pro-light-svg-icons";
import {
  Input,
  ListboxItem,
  ListboxSection,
  ListboxSectionProps,
} from "@repo/ui/components/control";
import { Icon } from "@repo/ui/components/display";
import { Button } from "@repo/ui/components/element";
import { Popover } from "@repo/ui/components/utility";
import { AsyncData, DataQueryResponse } from "@repo/ui/lib/async";
import { cn } from "@repo/ui/lib/class-merge";

export interface ComboboxProps<T extends object>
  extends Omit<AriaComboBoxProps<T>, "children" | "items"> {
  children: React.ReactNode | ((item: T) => React.ReactNode);
  options: (query: string) => AsyncData<DataQueryResponse<T>>;
}

function Root<T extends object>({
  children,
  options,
  ...props
}: ComboboxProps<T>) {
  const [filterText, setFilterText] = useImmer<string>("");
  const { data, isLoading } = options(filterText);

  return (
    <AriaComboBox
      {...props}
      className={cn("group flex flex-row gap-1", props.className)}
      inputValue={filterText}
      onInputChange={(query) => {
        setFilterText(query);
        props.onInputChange?.(query);
      }}
      items={data?.rows ?? []}
      menuTrigger="focus"
      allowsEmptyCollection
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
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <ListBox className="max-h-[inherit] overflow-auto p-1 outline-0">
            {children}
          </ListBox>
        )}
      </Popover>
    </AriaComboBox>
  );
}

function Option(props: ListBoxItemProps) {
  return <ListboxItem {...props} />;
}

function Section<T extends object>(props: ListboxSectionProps<T>) {
  return <ListboxSection {...props} />;
}

export const Combobox = Object.assign(Root, {
  Option,
  Section,
});
