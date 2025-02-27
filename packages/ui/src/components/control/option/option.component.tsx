import type { ComponentPropsWithRef } from "react";
import { cva } from "class-variance-authority";

import { faCheck } from "@repo/pro-solid-svg-icons";

import { Icon } from "../../element/icon/icon.component";
import { useOption } from "./option.context";

export type OptionProps<TValue> = ComponentPropsWithRef<"div"> & {
  value: TValue;
  disabled?: boolean;
};

export const variants = cva([
  // Basic layout
  "group/option flex cursor-default flex-row items-center gap-x-2 rounded-lg py-2.5 pr-3.5 pl-2 sm:py-1.5 sm:pr-3 sm:pl-1.5",
  // Typography
  "text-base/6 sm:text-sm/6",
  // Focus
  "outline-none",
  // Disabled
  "disabled:opacity-50",

  "highlighted:bg-primary-strong highlighted:text-inverse",
  // "selected:bg-primary-strong selected:text-inverse",
]);

export const Option = <TValue,>({
  value,
  children,
  disabled,
  className,
  ...props
}: OptionProps<TValue>) => {
  const { isHighlighted, isSelected, select, highlight } = useOption(value);

  const handleSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    select();
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      data-selected={isSelected}
      aria-activedescendant={isHighlighted ? "option" : undefined}
      data-highlighted={isHighlighted}
      onMouseDown={handleSelect}
      onMouseEnter={() => highlight()}
      className={variants({ className })}
      {...props}
    >
      <span className="relative flex size-5 items-center justify-center sm:size-4">
        {isSelected && (
          <Icon icon={faCheck} className="relative size-5 sm:size-4" />
        )}
      </span>
      <span>{children}</span>
    </div>
  );
};
