import type { ReactElement } from "react";
import { Children, isValidElement, useEffect, useMemo, useState } from "react";
import { cva } from "class-variance-authority";
import { useImmer } from "use-immer";

import type { InputTypeProps } from "../../form/input";
import type { OptionProps } from "../option";
// import { withControl } from "../../form/control/control.component";
// import { withField } from "../../form/field/with-field.hoc";
import { useControllable } from "../../utility/hooks/useControllable.hook";
import { ListboxProvider } from "./listbox.context";

const variants = cva(["bg-white shadow-md", "focus-within:bg-secondary"]);

export type ListboxProps<TValue, TOption> = Omit<
  InputTypeProps<TValue>,
  "children"
> & {
  options: TOption[];
  children:
    | ReactElement<OptionProps<TValue>>[]
    | ((option: TOption) => ReactElement<OptionProps<TValue>>);
};

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
    requiresState: true,
  });

  const [highlightedValue, setHighlightedValue] = useState<TValue | undefined>(
    undefined,
  );

  const select = (value?: TValue) => {
    setSelectedValue(value);
  };

  const highlight = (value?: TValue) => {
    setHighlightedValue(value);
  };

  const renderedChildren = useMemo(() => {
    return typeof children === "function"
      ? options.map((option) => children(option))
      : children;
  }, [children, options]);

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

// export const ListboxControl = withControl(ListboxInput);

// export const ListboxField = withField(ListboxControl);
