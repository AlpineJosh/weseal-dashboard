import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import * as Aria from "react-aria-components";

import { faCheck } from "@repo/pro-light-svg-icons";
import { Icon } from "@repo/ui/components/element";
import { cn } from "@repo/ui/lib/class-merge";

import { renderChildren } from "../../../lib/helpers";

const variants = {
  root: cva("space-y-0.5 p-1 outline-0"),
  option: cva(
    [
      // Basic layout
      "group/option grid cursor-default grid-cols-[theme(spacing.5),1fr] items-baseline gap-x-2 rounded-lg py-2.5 pl-2 pr-3.5 sm:grid-cols-[theme(spacing.4),1fr] sm:py-1.5 sm:pl-1.5 sm:pr-3",
      // Typography
      "text-base/6 text-content sm:text-sm/6",
      // Focus
      "outline-none data-[hovered]:bg-ring data-[hovered]:text-background",
      // Disabled
      "data-[disabled]:opacity-50",
    ],
    {
      variants: {
        isDisabled: {
          true: "",
        },
        isSelected: {
          true: "",
        },
        defaultVariants: {
          isDisabled: false,
          isSelected: false,
        },
      },
    },
  ),
  icon: cva(
    ["pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"],
    {
      variants: {
        isSelected: {
          true: "",
          false: "hidden",
        },
      },
      defaultVariants: {
        isSelected: false,
      },
    },
  ),
  section: cva(),
};

type ListboxProps<T> = Aria.ListBoxProps<T>;

const Root = <T extends object>({
  layout = "stack",
  orientation = "vertical",
  className,
  children,
  ...props
}: ListboxProps<T>) => {
  return (
    <Aria.ListBox
      layout={layout}
      orientation={orientation}
      className={cn(variants.root(), className)}
      {...props}
    >
      {children}
    </Aria.ListBox>
  );
};

type ListboxOptionProps<T> = Aria.ListBoxItemProps<T>;

export function Option<T extends object>({
  children,
  textValue,
  className,
  ...props
}: ListboxOptionProps<T>) {
  textValue ??= typeof children === "string" ? children : undefined;

  return (
    <Aria.ListBoxItem
      {...props}
      textValue={textValue}
      className={({ isSelected }) =>
        cn(
          variants.option({
            isDisabled: props.isDisabled,
            isSelected,
          }),
          className,
        )
      }
    >
      {(props) => (
        <>
          <Icon
            icon={faCheck}
            className="text-current relative hidden size-5 self-center group-data-[selected]/option:inline sm:size-4"
          />
          <span className={cn(className, "col-start-2")}>
            {renderChildren(children, props)}
          </span>
        </>
      )}
    </Aria.ListBoxItem>
  );
}

type ListboxSectionProps<T> = Aria.SectionProps<T> & {
  title?: string;
};

const Section = <T extends object>(props: ListboxSectionProps<T>) => {
  return (
    <Aria.Section {...props}>
      <Aria.Header className="bg-gray-100/60 text-gray-500 supports-[-moz-appearance:none]:bg-gray-100 dark:border-y-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-300 sticky -top-[5px] z-10 -mx-1 -mt-px truncate border-y px-4 py-1 text-sm font-semibold backdrop-blur-md [&+*]:mt-1">
        {props.title}
      </Aria.Header>
      <Aria.Collection items={props.items}>{props.children}</Aria.Collection>
    </Aria.Section>
  );
};

export const Listbox = Object.assign(Root, {
  Option,
  Section,
});
export type { ListboxProps, ListboxSectionProps, ListboxOptionProps };
