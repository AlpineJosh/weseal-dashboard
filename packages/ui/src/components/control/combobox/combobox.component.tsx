"use client";

import React, { useEffect } from "react";
import { cva } from "class-variance-authority";
import { Draft } from "immer";
import * as Aria from "react-aria-components";
import { useImmer } from "use-immer";

import { faAngleDown } from "@repo/pro-light-svg-icons";
import { Listbox } from "@repo/ui/components/control";
import { Icon } from "@repo/ui/components/element";
import { Popover } from "@repo/ui/components/utility";
import { AsyncData, DataQueryResponse } from "@repo/ui/lib/async";
import { cn } from "@repo/ui/lib/class-merge";

const variants = {
  root: cva(),
  group: cva([
    // Basic layout
    "group relative block w-full",
    // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
    "before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-white before:shadow",
    // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
    "dark:before:hidden",
    // Hide default focus styles
    "focus:outline-none",
    // Focus ring
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent after:data-[focus]:ring-2 after:data-[focus]:ring-ring",
    // Disabled state
    "data-[disabled]:opacity-50 before:data-[disabled]:bg-content/5 before:data-[disabled]:shadow-none",
  ]),
  input: cva([
    // Basic layout
    "relative block w-full appearance-none rounded-lg py-[calc(theme(spacing[2.5])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)]",
    // Set minimum height for when no value is selected
    "min-h-11 sm:min-h-9",
    // Horizontal padding
    "pl-[calc(theme(spacing[3.5])-1px)] pr-[calc(theme(spacing[1.5])-1px)] sm:pl-[calc(theme(spacing.3)-1px)]",
    // Typography
    "text-left text-base/6 text-content data-[placeholder]:text-content-muted sm:text-sm/6 forced-colors:text-[CanvasText]",
    // Border
    "border border-content/10 group-data-[active]:border-content/20 group-data-[hovered]:border-content/20",
    // Background color
    "bg-transparent dark:bg-white/5",
    // Invalid state
    "group-data-[invalid]:border-red-500 group-data-[invalid]:group-data-[hovered]:border-red-500 group-data-[invalid]:dark:border-red-600 group-data-[invalid]:data-[hovered]:dark:border-red-600",
    // Disabled state
    "group-data-[disabled]:border-content/20 group-data-[disabled]:opacity-100 group-data-[disabled]:dark:bg-white/[2.5%] dark:data-[hovered]:group-data-[disabled]:border-white/15",
    "focus:outline-none",
  ]),
  button: cva(["absolute inset-y-0 right-0 flex items-center pr-3"]),
  icon: cva(["flex size-3 items-center text-content-muted"]),
};

type Options<T extends object> =
  | T[]
  | ((query: string) => AsyncData<DataQueryResponse<T>>);

type UseOptionsProps<T extends object> = Omit<
  Aria.ComboBoxProps<T>,
  "items"
> & {
  isLoading: boolean;
  items: T[];
};

const useOptions = <T extends object, K extends keyof T & keyof Draft<T>>(
  optionsFn: Options<T>,
  keyAccessor: K,
  onSelectionChange: ((key: Aria.Key | null) => void) | undefined,
  selectedKey: Aria.Key | null,
): UseOptionsProps<T> => {
  if (typeof optionsFn === "function") {
    const [options, setOptions] = useImmer<T[]>([]);
    const [filterText, setFilterText] = useImmer<string>("");

    const { data, isLoading } = optionsFn(filterText);

    useEffect(() => {
      setOptions((draft) => {
        const newOptions: T[] = data?.rows ?? [];

        for (let i = draft.length - 1; i >= 0; i--) {
          const option = draft[i];
          if (
            option?.[keyAccessor] !== selectedKey &&
            !newOptions.some(
              (newOption) => newOption[keyAccessor] === option?.[keyAccessor],
            )
          ) {
            draft.splice(i, 1);
          }
        }

        for (const newOption of newOptions) {
          if (
            !draft.some(
              (option) => option[keyAccessor] === newOption[keyAccessor],
            )
          ) {
            draft.push(newOption as Draft<T>);
          }
        }
      });
    }, [data, isLoading]);

    return {
      items: options,
      inputValue: filterText,
      onInputChange: (query) => {
        setFilterText(query);
      },
      selectedKey,
      onSelectionChange: (key) => {
        // const value = options.find((option) => option[keyAccessor] === key);
        // setFilterText((value?.[keyAccessor] as string) ?? "");
        onSelectionChange?.(key);
      },
      isLoading,
    };
  } else {
    return { items: optionsFn, isLoading: false };
  }
};

type ComboboxProps<T extends object> = Omit<
  Aria.ComboBoxProps<T>,
  "children" | "items"
> & {
  children: React.ReactNode | ((item: T) => React.ReactNode);
  options: Options<T>;
  keyAccessor: keyof T & keyof Draft<T>;
};

const Root = <T extends object>({
  children,
  options,
  keyAccessor,
  className,
  selectedKey,
  onSelectionChange,
  ...props
}: ComboboxProps<T>) => {
  const { isLoading, ...optionProps } = useOptions(
    options,
    keyAccessor,
    onSelectionChange,
    selectedKey ?? null,
  );

  return (
    <Aria.ComboBox
      {...props}
      className={cn(variants.root(), className)}
      menuTrigger="focus"
      allowsEmptyCollection={true}
      {...optionProps}
    >
      <Aria.Group data-slot="control" className={cn(variants.group())}>
        <Aria.Input placeholder="Search" className={cn(variants.input())} />
        <Aria.Button className={cn(variants.button())}>
          <Icon
            icon={faAngleDown}
            aria-hidden
            className={cn(variants.icon())}
          />
        </Aria.Button>
      </Aria.Group>
      <Popover className="min-w-[--trigger-width]">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center p-4 text-xs text-content-muted">
            Loading...
          </div>
        ) : optionProps.items.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center p-4 text-xs text-content-muted">
            No results
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

export type { ComboboxProps };
