import type { ComponentPropsWithRef } from "react";
import { cva } from "class-variance-authority";

import { faCheck } from "@repo/pro-solid-svg-icons";

import { Icon } from "../../element/icon/icon.component";
import { useOption } from "./option.context";

export type OptionProps<TValue> = ComponentPropsWithRef<"div"> & {
  value: TValue;
  disabled?: boolean;
};

export const variants = cva(
  [
    // Basic layout
    "group/option grid cursor-default grid-cols-[theme(spacing.5),1fr] items-baseline gap-x-2 rounded-lg py-2.5 pl-2 pr-3.5 sm:grid-cols-[theme(spacing.4),1fr] sm:py-1.5 sm:pl-1.5 sm:pr-3",
    // Typography
    "text-base/6 sm:text-sm/6",
    // Focus
    "outline-none",
    // Disabled
    "disabled:opacity-50",
  ],
  {
    variants: {
      isHighlighted: {
        true: "bg-primary text-background",
        false: "text-content",
      },
      defaultVariants: {
        isHighlighted: false,
      },
    },
  },
);

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
      onMouseDown={handleSelect}
      onMouseEnter={() => highlight()}
      className={variants({ isHighlighted, isSelected, className })}
      {...props}
    >
      {isSelected ? (
        <Icon
          icon={faCheck}
          className="relative size-5 self-center sm:size-4"
        />
      ) : (
        <span className="relative size-5 self-center sm:size-4" />
      )}
      <span>{children}</span>
    </div>
  );
};
