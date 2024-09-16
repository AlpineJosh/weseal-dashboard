import type {
  ComboBoxProps as AriaComboBoxProps,
  ListBoxItemProps,
} from "react-aria-components";
import React, { useEffect, useMemo, useState } from "react";
import {
  ComboBox as AriaComboBox,
  Group,
  ListBox,
} from "react-aria-components";

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
import { AsyncData } from "@repo/ui/lib/async";
import { cn } from "@repo/ui/lib/class-merge";
import { renderChildren } from "@repo/ui/lib/helpers";

export interface ComboboxProps<
  T extends object,
  E extends AsyncData<Iterable<T>>,
> extends Omit<AriaComboBoxProps<T>, "children" | "items"> {
  children: React.ReactNode | ((item: T) => React.ReactNode);
  options: Iterable<T> | ((filter: string) => E);
}

function useOptions<T extends object, E extends AsyncData<Iterable<T>>>(
  options: Iterable<T> | ((filter: string) => E),
  filterText: string,
): E {
  if (typeof options === "function") {
    return options(filterText);
  }
  return { data: options, isLoading: false, error: undefined } as E;
}

function Root<T extends object, E extends AsyncData<Iterable<T>>>({
  children,
  options,
  ...props
}: ComboboxProps<T, E>) {
  const [filterText, setFilterText] = useState<string>("");
  const { data: items } = useOptions(options, filterText);

  return (
    <AriaComboBox
      {...props}
      className={cn("group flex flex-row gap-1", props.className)}
      inputValue={filterText}
      onInputChange={setFilterText}
      items={items}
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
        <ListBox className="max-h-[inherit] overflow-auto p-1 outline-0">
          {children}
        </ListBox>
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
