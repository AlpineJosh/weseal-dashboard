import type { FieldValues } from "react-hook-form";
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

type ListboxProps<T extends FieldValues> = Aria.ListBoxProps<T>;

const Root = <T extends FieldValues>({
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

type ListboxOptionProps<T> = Omit<Aria.ListBoxItemProps<T>, "id"> & {
  id: Aria.Key;
};

export function Option<T extends object>({
  children,
  className,
  textValue,
  ...props
}: ListboxOptionProps<T>) {
  textValue ??= typeof children === "string" ? children : textValue;
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
            className="relative hidden size-5 self-center text-content group-data-[selected]/option:inline sm:size-4"
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
      <Aria.Header className="sticky -top-[5px] z-10 -mx-1 -mt-px truncate border-y bg-background-muted px-4 py-1 text-sm font-semibold text-content-muted backdrop-blur-md supports-[-moz-appearance:none]:bg-background-muted [&+*]:mt-1">
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
