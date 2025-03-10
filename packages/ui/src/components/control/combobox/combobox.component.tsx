import type { ReactElement } from "react";
import { cva } from "class-variance-authority";
import { useImmer } from "use-immer";

import { cn } from "@repo/ui/lib/class-merge";

import type { InputTypeProps } from "../../form/input";
import type { OptionProps } from "../option/option.component";
import { useControllable } from "../../../hooks/use-controllable.hook";
import { Input } from "../../form/input";
import { Listbox } from "../listbox/listbox.component";

const variants = {
  combobox: cva([
    "group relative block w-full",
    "before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-white before:shadow",
    "dark:before:hidden",
    "focus:outline-none",
  ]),
  group: cva([
    "relative block w-full",
    "after:data-[focus]:ring-ring after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset after:data-[focus]:ring-2",
    "before:data-[disabled]:bg-content/5 data-[disabled]:opacity-50 before:data-[disabled]:shadow-none",
  ]),
  input: cva([
    "relative block w-full appearance-none rounded-lg py-[calc(theme(spacing[2.5])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)]",
    "min-h-11 sm:min-h-9",
    "pr-[calc(theme(spacing[1.5])-1px)] pl-[calc(theme(spacing[3.5])-1px)] sm:pl-[calc(theme(spacing.3)-1px)]",
    "text-content data-[placeholder]:text-content-muted text-left text-base/6 sm:text-sm/6 forced-colors:text-[CanvasText]",
    "border-content/10 group-data-[active]:border-content/20 group-data-[hovered]:border-content/20 border",
    "bg-transparent dark:bg-white/5",
    "focus:outline-none",
  ]),
  button: cva(["absolute inset-y-0 right-0 flex items-center pr-3"]),
  icon: cva(["text-content-muted flex size-3 items-center"]),
  dropdown: cva([
    "absolute z-50 mt-1 w-full rounded-lg bg-white shadow-lg dark:bg-gray-800",
    "border-content/10 border",
    "max-h-60 overflow-auto",
  ]),
  option: cva([
    "cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700",
    "data-[selected=true]:bg-primary-50 dark:data-[selected=true]:bg-primary-900",
  ]),
};

export type ComboboxProps<TValue, TOption> = Omit<
  InputTypeProps<TValue>,
  "children"
> & {
  children:
    | ReactElement<OptionProps<TValue>>[]
    | ((option: TOption) => ReactElement<OptionProps<TValue>>);
  options: TOption[];
};

export const Combobox = <TValue, TOption>({
  children,
  name,
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

  return (
    // <PopoverProvider>
    <Input className={className} {...props}>
      <input
        className={variants.input()}
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
      />
      {/* <Popover> */}
      <Listbox
        name={name}
        value={selectedValue}
        defaultValue={defaultValue}
        onChange={setSelectedValue}
        options={options}
        children={children}
      />
      {/* </Popover> */}
    </Input>
    // </PopoverProvider>
  );
};
