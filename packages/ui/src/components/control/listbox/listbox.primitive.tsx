import type {
  ListBoxProps as AriaListBoxProps,
  ListBoxItemProps,
  SectionProps,
} from "react-aria-components";
import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Collection,
  composeRenderProps,
  Header,
  Section,
} from "react-aria-components";

import { faCheck } from "@repo/pro-light-svg-icons";
import { Icon } from "@repo/ui/components/element";
import { cn } from "@repo/ui/lib/class-merge";

export type ListboxProps<T> = Omit<
  AriaListBoxProps<T>,
  "layout" | "orientation"
>;

export const Listbox = forwardRef(
  <T extends object>(
    { children, ...props }: ListboxProps<T>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    return (
      <AriaListBox
        {...props}
        className={cn(
          "rounded-lg border border-border p-1 outline-0",
          props.className,
        )}
        ref={ref}
      >
        {children}
      </AriaListBox>
    );
  },
);

export const itemStyles = cva(
  "group relative flex cursor-default select-none items-center gap-8 rounded-md px-2.5 py-1.5 text-sm will-change-transform forced-color-adjust-none hover:bg-accent",
  {
    variants: {
      variant: {
        select: "",
        list: "",
      },
      isSelected: {
        false:
          "text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700 outline-offset-2",
        true: "text-white outline-white dark:outline-white forced-colors:bg-primary-300 forced-colors:text-primary-500 forced-colors:outline-primary-500 [&+[data-selected]]:rounded-t-none [&:has(+[data-selected])]:rounded-b-none outline-offset-4",
      },
      isDisabled: {
        true: "text-slate-300 dark:text-zinc-600 forced-colors:text-gray-300",
      },
    },
    defaultVariants: {
      isSelected: false,
      isDisabled: false,
    },
  },
);

export function ListboxItem(props: ListBoxItemProps) {
  const textValue =
    props.textValue ??
    (typeof props.children === "string" ? props.children : undefined);
  return (
    <AriaListBoxItem
      {...props}
      textValue={textValue}
      className={({ isSelected }) =>
        cn(
          itemStyles({
            isDisabled: props.isDisabled,
            isSelected,
          }),
          props.className,
        )
      }
    >
      {composeRenderProps(props.children, (children) => (
        <>
          {children}
          <div className="bg-white/20 absolute bottom-0 left-4 right-4 hidden h-px forced-colors:bg-[HighlightText] [.group[data-selected]:has(+[data-selected])_&]:block" />
        </>
      ))}
    </AriaListBoxItem>
  );
}

export const dropdownItemStyles = cva(
  "group flex cursor-default select-none items-center gap-4 rounded-lg py-2 pl-3 pr-1 text-sm outline outline-0 forced-color-adjust-none",
  {
    variants: {
      isDisabled: {
        false: "text-gray-900 dark:text-zinc-100",
        true: "text-gray-300 dark:text-zinc-600",
      },
      isFocused: {
        true: "bg-blue-600 text-white",
      },
      isOpen: {
        true: "",
      },
    },
    compoundVariants: [
      {
        isFocused: false,
        isOpen: true,
        className: "bg-gray-100 dark:bg-zinc-700/60",
      },
    ],
  },
);

export function DropdownItem(props: ListBoxItemProps) {
  const textValue =
    props.textValue ??
    (typeof props.children === "string" ? props.children : undefined);
  return (
    <AriaListBoxItem
      {...props}
      textValue={textValue}
      className={dropdownItemStyles}
    >
      {composeRenderProps(props.children, (children, { isSelected }) => (
        <>
          <span className="group-selected:font-semibold flex flex-1 items-center gap-2 truncate font-normal">
            {children}
          </span>
          <span className="flex w-5 items-center">
            {isSelected && <Icon icon={faCheck} />}
          </span>
        </>
      ))}
    </AriaListBoxItem>
  );
}

export interface DropdownSectionProps<T> extends SectionProps<T> {
  title?: string;
}

export function DropdownSection<T extends object>(
  props: DropdownSectionProps<T>,
) {
  return (
    <Section className="after:block after:h-[5px] after:content-[''] first:-mt-[5px]">
      <Header className="bg-gray-100/60 text-gray-500 supports-[-moz-appearance:none]:bg-gray-100 dark:border-y-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-300 sticky -top-[5px] z-10 -mx-1 -mt-px truncate border-y px-4 py-1 text-sm font-semibold backdrop-blur-md [&+*]:mt-1">
        {props.title}
      </Header>
      <Collection items={props.items}>{props.children}</Collection>
    </Section>
  );
}
