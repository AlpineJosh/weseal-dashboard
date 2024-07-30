import type {
  ListBoxProps as AriaListBoxProps,
  ListBoxItemProps,
  SectionProps,
} from "react-aria-components";
import { forwardRef } from "react";
import { Icon } from "@/components/display/icon";
import { cn } from "@/lib/class-merge";
import { faCheck } from "@fortawesome/pro-light-svg-icons";
import { cva } from "class-variance-authority";
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Collection,
  composeRenderProps,
  Header,
  Section,
} from "react-aria-components";

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
          "space-y-0.5 rounded-lg border border-input p-1 outline-0",
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
  "group relative flex cursor-default select-none items-center gap-8 rounded-md px-2.5 py-1.5 text-sm will-change-transform forced-color-adjust-none",
  {
    variants: {
      variant: {
        dropdown: "",
        listbox: "",
      },
      isSelected: {
        true: "", //"text-white outline-white dark:outline-white forced-colors:bg-primary-300 forced-colors:text-primary-500 forced-colors:outline-primary-500 [&+[data-selected]]:rounded-t-none [&:has(+[data-selected])]:rounded-b-none outline-offset-4",
      },
      isDisabled: {
        true: "", //"text-slate-300 dark:text-zinc-600 forced-colors:text-gray-300",
      },
    },
    compoundVariants: [
      {
        variant: "dropdown",
        isSelected: false,
        className: "hover:bg-accent",
      },
      {
        variant: "dropdown",
        isSelected: true,
        className: "bg-accent",
      },
      {
        variant: "listbox",
        isSelected: false,
        className: "hover:bg-foreground hover:text-background",
      },
      {
        variant: "listbox",
        isSelected: true,
        className: "bg-foreground text-background",
      },
    ],
    defaultVariants: {
      isSelected: false,
      isDisabled: false,
    },
  },
);

export interface ListboxItemProps extends ListBoxItemProps {
  variant?: "dropdown" | "listbox";
}

export function ListboxItem({
  children,
  className,
  variant = "listbox",
  ...props
}: ListboxItemProps) {
  const textValue =
    props.textValue ?? (typeof children === "string" ? children : undefined);
  return (
    <AriaListBoxItem
      {...props}
      textValue={textValue}
      className={({ isSelected }) =>
        cn(
          itemStyles({
            isDisabled: props.isDisabled,
            isSelected,
            variant,
          }),
          className,
        )
      }
    >
      {composeRenderProps(children, (children, { isSelected }) => (
        <>
          <span className="flex-1 items-center gap-2 truncate">{children}</span>
          {variant === "dropdown" && (
            <span className="flex w-5 items-center">
              {isSelected && <Icon icon={faCheck} className="text-current" />}
            </span>
          )}
        </>
      ))}
    </AriaListBoxItem>
  );
}

export interface ListboxSectionProps<T> extends SectionProps<T> {
  title?: string;
}

export function ListboxSection<T extends object>(
  props: ListboxSectionProps<T>,
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
