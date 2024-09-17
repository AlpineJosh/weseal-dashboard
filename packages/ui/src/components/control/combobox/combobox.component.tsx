"use client";

import type {
  ComboBoxProps as AriaComboBoxProps,
  Key,
} from "react-aria-components";
import { useEffect } from "react";
import { Draft } from "immer";
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
  keyAccessor: keyof T;
  ref?: React.Ref<HTMLInputElement>;
}

const Root = <T extends object>({
  children,
  options,
  ref,
  keyAccessor,
  ...props
}: ComboboxProps<T>) => {
  const [filterText, setFilterText] = useImmer<string>("");
  const [items, setItems] = useImmer<T[]>([]);
  const [selectedKey, setSelectedKey] = useImmer<Key | null>(null);
  const { data, isLoading } = options(filterText);

  useEffect(() => {
    setItems((draft) => {
      const newItems: T[] = data?.rows ?? [];

      for (let i = draft.length - 1; i >= 0; i--) {
        const item = draft[i];
        if (
          item[keyAccessor as keyof Draft<T>] !== selectedKey &&
          !newItems.some(
            (newItem) =>
              newItem[keyAccessor] === item[keyAccessor as keyof Draft<T>],
          )
        ) {
          draft.splice(i, 1);
        }
      }

      for (const newItem of newItems) {
        if (!draft.some((item) => item[keyAccessor] === newItem[keyAccessor])) {
          draft.push(newItem);
        }
      }
    });
  }, [data, isLoading]);

  return (
    <AriaComboBox
      // ref={ref}
      {...props}
      className={cn("group flex flex-row gap-1", props.className)}
      inputValue={filterText}
      onInputChange={(query) => {
        setFilterText(query);
        props.onInputChange?.(query);
      }}
      // selectedKey={selectedKey}
      // onSelectionChange={(key) => {
      //   setFilterText(key as string);
      //   setSelectedKey(key);
      //   props.onSelectionChange?.(key);
      // }}
      items={items}
      menuTrigger="focus"
      allowsEmptyCollection={true}
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
          <div className="flex h-full w-full items-center justify-center p-4 text-xs text-muted-foreground">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center p-4 text-xs text-muted-foreground">
            No results
          </div>
        ) : (
          <ListBox className="max-h-[inherit] overflow-auto p-1 outline-0">
            {children}
          </ListBox>
        )}
      </Popover>
    </AriaComboBox>
  );
};

export const Combobox = Object.assign(Root, {
  Option: ListboxItem,
  Section: ListboxSection,
});
