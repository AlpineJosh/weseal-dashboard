"use client";

import type { Draft } from "immer";
import React, { useEffect, useRef } from "react";
import { cva } from "class-variance-authority";
import * as Aria from "react-aria-components";
import { useImmer } from "use-immer";

import { faAngleDown } from "@repo/pro-light-svg-icons";
import { Listbox } from "@repo/ui/components/control";
import { Icon } from "@repo/ui/components/element";
import { Popover } from "@repo/ui/components/utility";
import { cn } from "@repo/ui/lib/class-merge";

import type { ControlRenderProps } from "../../form/field/field.component";

const variants = {
  root: cva(),
  group: cva([
    "group relative block w-full",
    "before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-white before:shadow",
    "dark:before:hidden",
    "focus:outline-none",
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent after:data-[focus]:ring-2 after:data-[focus]:ring-ring",
    "data-[disabled]:opacity-50 before:data-[disabled]:bg-content/5 before:data-[disabled]:shadow-none",
  ]),
  input: cva([
    "relative block w-full appearance-none rounded-lg py-[calc(theme(spacing[2.5])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)]",
    "min-h-11 sm:min-h-9",
    "pl-[calc(theme(spacing[3.5])-1px)] pr-[calc(theme(spacing[1.5])-1px)] sm:pl-[calc(theme(spacing.3)-1px)]",
    "text-left text-base/6 text-content data-[placeholder]:text-content-muted sm:text-sm/6 forced-colors:text-[CanvasText]",
    "border border-content/10 group-data-[active]:border-content/20 group-data-[hovered]:border-content/20",
    "bg-transparent dark:bg-white/5",
    "group-data-[invalid]:border-red-500 group-data-[invalid]:group-data-[hovered]:border-red-500 group-data-[invalid]:dark:border-red-600 group-data-[invalid]:data-[hovered]:dark:border-red-600",
    "group-data-[disabled]:border-content/20 group-data-[disabled]:opacity-100 group-data-[disabled]:dark:bg-white/[2.5%] dark:data-[hovered]:group-data-[disabled]:border-white/15",
    "focus:outline-none",
  ]),
  button: cva(["absolute inset-y-0 right-0 flex items-center pr-3"]),
  icon: cva(["flex size-3 items-center text-content-muted"]),
};

interface DataFunctionResult<T> {
  isLoading: boolean;
  items: T[];
}

type KeyAccessor<T> = (item: T) => Aria.Key;
type TextValueAccessor<T> = (item: T) => string;
// Utility to infer the data type from the data function
type ExtractDataType<
  T extends (filterText: string) => DataFunctionResult<object>,
> = T extends (filterText: string) => DataFunctionResult<infer U> ? U : never;

interface AsyncComboboxProps<
  TDataFunction extends (filterText: string) => DataFunctionResult<object>, // Keeping any for better inference
> extends Partial<ControlRenderProps<Aria.Key | null>> {
  children: (item: ExtractDataType<TDataFunction>) => React.ReactNode;
  keyAccessor: KeyAccessor<ExtractDataType<TDataFunction>>;
  data: TDataFunction;
  textValueAccessor: TextValueAccessor<ExtractDataType<TDataFunction>>;
}

const AsyncRoot = <
  TDataFunction extends (filterText: string) => DataFunctionResult<object>,
>({
  // Changed from unknown to any
  data,
  keyAccessor,
  value,
  onChange,
  textValueAccessor,
  ...props
}: AsyncComboboxProps<TDataFunction>) => {
  type TData = ExtractDataType<TDataFunction>;

  const [filterText, setFilterText] = useImmer("");

  const [options, setOptions] = useImmer<TData[]>([]);

  const { items, isLoading } = data(filterText);

  useEffect(() => {
    setOptions((draft) => {
      const newOptions: TData[] = items as TData[];
      // Remove old options not in the new list
      for (let i = draft.length - 1; i >= 0; i--) {
        const option = draft[i];
        if (
          option &&
          keyAccessor(option as TData) !== value &&
          !newOptions.some(
            (newOption) =>
              keyAccessor(newOption) === keyAccessor(option as TData),
          )
        ) {
          void draft.splice(i, 1);
        }
      }

      // console.log(draft.map((o) => o.id).toString());

      // Add new options
      for (const newOption of newOptions) {
        if (
          !draft.some(
            (option) => keyAccessor(option as TData) === keyAccessor(newOption),
          )
        ) {
          draft.push(newOption as Draft<TData>);
        }
      }

      // console.log(draft.map((o) => o.id).toString());
    });
  }, [items, isLoading, filterText, setOptions, keyAccessor, value]);

  const handleChange = (key: Aria.Key | null) => {
    const option = key ? options.find((o) => keyAccessor(o) === key) : null;
    if (option) {
      setFilterText(textValueAccessor(option));
    }
    onChange?.(key);
  };

  const message = isLoading
    ? "Loading..."
    : options.length === 0
      ? "No results"
      : undefined;

  return (
    <Root
      {...props}
      onChange={handleChange}
      value={value}
      inputValue={filterText}
      onInputChange={setFilterText}
      items={options}
      message={message}
    />
  );
};

type ComboboxProps<T extends object> = Omit<
  Aria.ComboBoxProps<T>,
  "children" | "items" | "onSelectionChange" | "selectedKey"
> &
  Partial<ControlRenderProps<Aria.Key | null>> & {
    items?: T[];
    children: React.ReactNode | ((item: T) => React.ReactNode);
    message?: React.ReactNode;
    placeholder?: string;
  };

const Root = <T extends object>({
  className,
  children,
  menuTrigger = "focus",
  allowsEmptyCollection = true,
  value,
  onChange,
  message,
  placeholder,
  ...props
}: ComboboxProps<T>) => {
  return (
    <Aria.ComboBox
      {...props}
      className={cn(variants.root(), className)}
      menuTrigger={menuTrigger}
      allowsEmptyCollection={allowsEmptyCollection}
      onSelectionChange={onChange}
      selectedKey={value}
    >
      <Aria.Group data-slot="control" className={cn(variants.group())}>
        <Aria.Input
          placeholder={placeholder}
          className={cn(variants.input())}
        />
        <Aria.Button className={cn(variants.button())}>
          <Icon
            icon={faAngleDown}
            aria-hidden
            className={cn(variants.icon())}
          />
        </Aria.Button>
      </Aria.Group>
      <Popover className="min-w-[--trigger-width]">
        {message ? (
          <div className="flex h-full w-full items-center justify-center p-4 text-xs text-content-muted">
            {message}
          </div>
        ) : (
          <Listbox className="max-h-[inherit] overflow-auto p-1 outline-0">
            {children}
          </Listbox>
        )}
      </Popover>
    </Aria.ComboBox>
  );
};

export const Combobox = Object.assign(Root, {
  Option: Listbox.Option,
  Section: Listbox.Section,
});

export const AsyncCombobox = Object.assign(AsyncRoot, {
  Option: Listbox.Option,
  Section: Listbox.Section,
});

export type { ComboboxProps, AsyncComboboxProps };
