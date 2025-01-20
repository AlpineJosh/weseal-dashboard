import type { ReactElement } from "react";
import { Children, isValidElement, useEffect, useMemo, useState } from "react";
import { cva } from "class-variance-authority";
import { useImmer } from "use-immer";

import type { OptionProps } from "../option";
import type { ControlInputProps } from "../types";
import { useControllable } from "../../utility/hooks/useControllable.hook";
import { ListboxProvider } from "./listbox.context";

const variants = cva(["bg-white shadow-md", "focus-within:bg-secondary"]);

export interface StaticListboxParent<TValue> {
  children:
    | ReactElement<OptionProps<TValue>>
    | ReactElement<OptionProps<TValue>>[];
  options: undefined;
}

export interface DynamicListboxParent<TValue, TOption> {
  children: (option: TOption) => ReactElement<OptionProps<TValue>>;
  options: TOption[];
}

export type OptionSelectProps<TValue, TOption> =
  | StaticListboxParent<TValue>
  | DynamicListboxParent<TValue, TOption>;

export type ListboxProps<TValue, TOption> = Omit<
  ControlInputProps<TValue>,
  "children"
> &
  OptionSelectProps<TValue, TOption>;

export const Listbox = <TValue, TOption>({
  children,
  className,
  options,
  value,
  defaultValue,
  onChange,
}: ListboxProps<TValue, TOption>) => {
  const [values, setValues] = useImmer<TValue[]>([]);
  const [selectedValue, setSelectedValue] = useControllable({
    value,
    onChange,
    defaultValue,
  });

  const [highlightedValue, setHighlightedValue] = useState<TValue | undefined>(
    undefined,
  );

  const select = (value?: TValue) => {
    setSelectedValue(value);
    setHighlightedValue(undefined);
  };

  const highlight = (value?: TValue) => {
    setHighlightedValue(value);
  };

  const renderedChildren = useMemo(() => {
    return (
      typeof children === "function" && options
        ? options.map((option) => children(option))
        : children
    ) as ReactElement<OptionProps<TValue>>[];
  }, [children, options, selectedValue, highlightedValue]);

  useEffect(() => {
    const renderedValues = Children.map(renderedChildren, (child) => {
      if (isValidElement(child) && !child.props.disabled) {
        return child.props.value;
      }
    });

    setValues(renderedValues);
  }, [renderedChildren, setValues]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const highlightedIndex = values.findIndex(
      (value) => value === highlightedValue,
    );
    switch (event.key) {
      case "ArrowDown":
        if (highlightedIndex < options.length - 1) {
          event.preventDefault();
          setHighlightedValue(
            highlightedValue !== undefined
              ? values[highlightedIndex + 1]
              : values[0],
          );
        }
        break;
      case "ArrowUp":
        if (highlightedIndex > 0) {
          event.preventDefault();
          setHighlightedValue(
            highlightedValue !== undefined
              ? values[highlightedIndex - 1]
              : values[values.length - 1],
          );
        }
        break;
      case "Enter":
      case " ":
        if (highlightedValue) {
          event.preventDefault();
          setSelectedValue(highlightedValue);
          setHighlightedValue(undefined);
        }
        break;
      case "Home":
        event.preventDefault();
        setHighlightedValue(values[0]);
        break;
      case "End":
        event.preventDefault();
        setHighlightedValue(values[values.length - 1]);
        break;
    }
  };

  return (
    <div
      role="listbox"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={variants({ className })}
    >
      <ListboxProvider
        selectedValue={selectedValue}
        setSelectedValue={select}
        highlightedValue={highlightedValue}
        setHighlightedValue={highlight}
      >
        {renderedChildren}
      </ListboxProvider>
    </div>
  );
};
