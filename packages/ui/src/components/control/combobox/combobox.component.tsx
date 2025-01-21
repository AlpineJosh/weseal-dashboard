import type { ReactElement, ReactNode } from "react";
import { Children, useMemo } from "react";
import { cva } from "class-variance-authority";
import { useImmer } from "use-immer";

import { cn } from "@repo/ui/lib/class-merge";

import type {
  DynamicListboxParent,
  OptionSelectProps,
  StaticListboxParent,
} from "../listbox/listbox.new";
import type { OptionProps } from "../option/option.component";
import type { ControlInputProps } from "../types";
import { useControllable } from "../../utility/hooks/useControllable.hook";
import { PopoverProvider } from "../../utility/popover/popover.context";
import { Popover } from "../../utility/popover/popover.new";
import { Listbox } from "../listbox/listbox.new";

const variants = {
  combobox: cva([
    "group relative block w-full",
    "before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-white before:shadow",
    "dark:before:hidden",
    "focus:outline-none",
  ]),
  group: cva([
    "relative block w-full",
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
    "focus:outline-none",
  ]),
  button: cva(["absolute inset-y-0 right-0 flex items-center pr-3"]),
  icon: cva(["flex size-3 items-center text-content-muted"]),
  dropdown: cva([
    "dark:bg-gray-800 absolute z-50 mt-1 w-full rounded-lg bg-white shadow-lg",
    "border border-content/10",
    "max-h-60 overflow-auto",
  ]),
  option: cva([
    "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer px-4 py-2",
    "data-[selected=true]:bg-primary-50 dark:data-[selected=true]:bg-primary-900",
  ]),
};

export type ComboboxProps<TValue, TOption> = Omit<
  ControlInputProps<TValue>,
  "children"
> &
  OptionSelectProps<TValue, TOption> & {};

export const Combobox = <TValue, TOption>({
  children,
  options,
  value,
  defaultValue,
  onChange,
  className,
  ...props
}: ComboboxProps<TValue, TOption>) => {
  const [filterValue, setFilterValue] = useImmer("");

  const [selectedValue, setSelectedValue] = useControllable({
    value,
    defaultValue,
    onChange,
  });

  const renderedSelectedOption = useMemo(() => {
    const renderedChildren = (
      typeof children === "function" && Array.isArray(options)
        ? options.map((option) => children(option))
        : children
    ) as ReactElement<OptionProps<TValue>>;

    let renderedSelectedOption: ReactElement<OptionProps<TValue>> | undefined;

    Children.forEach(renderedChildren, (child) => {
      if (child.props.value === selectedValue) {
        renderedSelectedOption = child;
      }
    });

    return renderedSelectedOption;
  }, [selectedValue, children, options]);

  const optionSelectProps =
    typeof children === "function"
      ? ({
          options,
          children,
        } as DynamicListboxParent<TValue, TOption>)
      : ({
          options: undefined,
          children: children,
        } as StaticListboxParent<TValue>);

  return (
    // <PopoverProvider>
    <span className={cn(variants.combobox(), className)} {...props}>
      {renderedSelectedOption}
      <input
        className={variants.input()}
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
      />
      {/* <Popover> */}
      <Listbox
        value={selectedValue}
        defaultValue={defaultValue}
        onChange={setSelectedValue}
        {...optionSelectProps}
      />
      {/* </Popover> */}
    </span>
    // </PopoverProvider>
  );
};
