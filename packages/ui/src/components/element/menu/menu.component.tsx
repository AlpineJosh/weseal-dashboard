"use client";

import { IconDefinition } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MenuTriggerProps } from "react-aria-components";

import { Popover } from "@repo/ui/components/utility";

import { Button, ButtonProps } from "../button";
import * as MenuPrimitive from "./menu.primitive";

interface MenuPropsBase<T extends object>
  extends MenuPrimitive.MenuProps<T>,
    Omit<MenuTriggerProps, "children"> {
  variant?: ButtonProps["variant"];
}

interface MenuPropsWithLabel<T extends object> extends MenuPropsBase<T> {
  label: string;
  icon?: IconDefinition;
}

interface MenuPropsWithIcon<T extends object> extends MenuPropsBase<T> {
  label?: string;
  icon: IconDefinition;
}

type MenuProps<T extends object> = MenuPropsWithLabel<T> | MenuPropsWithIcon<T>;

const Root = <T extends object>({
  children,
  label,
  icon,
  variant,
  ...props
}: MenuProps<T>) => {
  return (
    <MenuPrimitive.Menu {...props}>
      <Button variant={variant}>
        {label}
        {icon && <FontAwesomeIcon icon={icon} />}
      </Button>
      <Popover>
        <MenuPrimitive.Items>{children}</MenuPrimitive.Items>
      </Popover>
    </MenuPrimitive.Menu>
  );
};

type MenuItemProps<T extends object> = MenuPrimitive.MenuItemProps<T>;

export const Menu = Object.assign(Root, { Item: MenuPrimitive.Item });
export type { MenuProps, MenuItemProps };
