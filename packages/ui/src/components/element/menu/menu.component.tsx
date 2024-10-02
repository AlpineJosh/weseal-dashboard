"use client";

import React from "react";
import { cva } from "class-variance-authority";
import * as Aria from "react-aria-components";

import { Popover } from "@repo/ui/components/utility";

import { cn } from "../../../lib/class-merge";

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
};

type MenuProps = Aria.MenuTriggerProps;

const Root = ({ children, ...props }: MenuProps) => {
  return <Aria.MenuTrigger {...props}>{children}</Aria.MenuTrigger>;
};

type MenuItemsProps<T extends object> = Aria.MenuProps<T>;

const Items = <T extends object>({
  children,
  className,
  ...props
}: MenuItemsProps<T>) => {
  return (
    <Popover>
      <Aria.Menu {...props} className={cn(variants.items(), className)}>
        {children}
      </Aria.Menu>
    </Popover>
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

export const Menu = Object.assign(Root, { Items, Item });
export type { MenuProps, MenuItemsProps, MenuItemProps };
