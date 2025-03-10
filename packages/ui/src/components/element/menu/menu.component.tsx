"use client";

import type { ComponentProps } from "react";
import * as Aria from "react-aria-components";

import { Popover } from "@repo/ui/components/utility";

const variants = {
  root: cva(),
  items: cva([
    // Handle scrolling when menu won't fit in viewport
    "overflow-y-auto p-1",
  ]),
  item: cva([
    // Base styles
    "group cursor-default rounded-lg px-3.5 py-2.5 focus:outline-none sm:px-3 sm:py-1.5",
    // Text styles
    "text-left text-base/6 text-content sm:text-sm/6",
    // Focus
    "data-[focused]:bg-primary data-[focused]:text-background",
    // Disabled state
    "data-[disabled]:opacity-50",
    // Icons
    "[&>[data-slot=icon]]:col-start-1 [&>[data-slot=icon]]:row-start-1 [&>[data-slot=icon]]:-ml-0.5 [&>[data-slot=icon]]:mr-2.5 [&>[data-slot=icon]]:size-5 sm:[&>[data-slot=icon]]:mr-2 [&>[data-slot=icon]]:sm:size-4",
    "[&>[data-slot=icon]]:text-content-muted [&>[data-slot=icon]]:data-[focused]:text-background",
    // Avatar
    "[&>[data-slot=avatar]]:-ml-1 [&>[data-slot=avatar]]:mr-2.5 [&>[data-slot=avatar]]:size-6 sm:[&>[data-slot=avatar]]:mr-2 sm:[&>[data-slot=avatar]]:size-5",
  ]),
  section: cva([
    "flex flex-col gap-1", // Added padding here instead
    "[&:first-child]:-mt-1 [&:not(:first-child)]:mt-1 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-content/10", // Border above non-first sections
  ]),
  sectionHeader: cva([
    "-mx-1 border-b border-content/10 bg-background-muted px-3.5 py-1 text-xs font-medium text-content-muted",
  ]),
};

type MenuProps = Aria.MenuTriggerProps;

const Root = ({ children, ...props }: MenuProps) => {
  return <Aria.MenuTrigger {...props}>{children}</Aria.MenuTrigger>;
};

type MenuItemsProps<T extends object> = Aria.MenuProps<T> & {
  placement?: Aria.PopoverProps["placement"];
};

const Items = <T extends object>({
  children,
  className,
  placement = "bottom start",
  ...props
}: MenuItemsProps<T>) => {
  return (
    <Popover placement={placement}>
      <Aria.Menu {...props} className={cn(variants.items(), className)}>
        {children}
      </Aria.Menu>
    </Popover>
  );
};

type MenuSectionProps = Aria.SectionProps<unknown>;

const Section = ({ children }: MenuSectionProps) => {
  return (
    <Aria.Section className={cn(variants.section())}>{children}</Aria.Section>
  );
};

type MenuSectionHeaderProps = ComponentProps<"header">;

const SectionHeader = ({ children }: MenuSectionHeaderProps) => {
  return (
    <Aria.Header className={cn(variants.sectionHeader())}>
      {children}
    </Aria.Header>
  );
};

type MenuItemProps<T extends object> = Aria.MenuItemProps<T>;

const Item = <T extends object>({
  children,
  className,
  ...props
}: MenuItemProps<T>) => {
  return (
    <Aria.MenuItem {...props} className={cn(variants.item(), className)}>
      {children}
    </Aria.MenuItem>
  );
};

export const Menu = Object.assign(Root, {
  Items,
  Item,
  Section,
  SectionHeader,
});
export type { MenuProps, MenuItemsProps, MenuItemProps };
