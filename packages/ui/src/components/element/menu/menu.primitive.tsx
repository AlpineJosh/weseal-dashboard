"use client";

import * as Aria from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

export const Menu = Aria.MenuTrigger;

export type MenuProps<T extends object> = Aria.MenuProps<T>;

export const Items = <T extends object>({
  className,
  ...props
}: MenuProps<T>) => (
  <Aria.Menu
    className={cn(
      "min-w-40 max-w-80 overflow-auto p-1 focus-visible:outline-none",
      className,
    )}
    {...props}
  />
);

export type MenuItemProps<T extends object> = Aria.MenuItemProps<T>;

export const Item = <T extends object>({
  className,
  ...props
}: MenuItemProps<T>) => (
  <Aria.MenuItem
    className={cn(
      "block select-none rounded-sm px-4 py-2 text-sm focus-visible:outline-none rac-focus:bg-muted",
      className,
    )}
    {...props}
  />
);
