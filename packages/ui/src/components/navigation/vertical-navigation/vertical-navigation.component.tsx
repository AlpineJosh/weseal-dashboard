"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef, useState } from "react";
import { cva } from "class-variance-authority";
import { Link as AriaLink } from "react-aria-components";

import type { IconDefinition } from "@repo/pro-light-svg-icons";
import { faChevronDown } from "@repo/pro-light-svg-icons";
import { Icon } from "@repo/ui/components/display";
import { cn } from "@repo/ui/lib/class-merge";

import type { LinkProps } from "../link";

type VerticalNavigationProps = ComponentPropsWithoutRef<"nav">;

const Nav = forwardRef<HTMLDivElement, VerticalNavigationProps>(
  ({ className, ...props }, ref) => {
    return (
      <nav ref={ref} className={cn("flex flex-col", className)} {...props}>
        <ul role="list" className="list-none space-y-1">
          {props.children}
        </ul>
      </nav>
    );
  },
);

const itemStyles = cva(
  "group flex w-full flex-row items-center gap-x-3 rounded-md p-2 text-start text-sm font-semibold leading-6",
  {
    variants: {
      isActive: {
        true: "bg-muted text-primary",
        false: "text-muted-foreground hover:bg-muted hover:text-primary",
      },
    },
  },
);

type ItemProps = LinkProps &
  React.RefAttributes<HTMLAnchorElement> & {
    isActive?: boolean;
    title: string;
    icon?: IconDefinition;
    notifications?: number;
  };

const Item = forwardRef<HTMLAnchorElement, ItemProps>(
  ({ title, icon, isActive = false, className, ...props }, ref) => {
    return (
      <li>
        <AriaLink
          ref={ref}
          className={cn(itemStyles({ isActive }), className)}
          {...props}
        >
          {icon && <Icon icon={icon} fixedWidth size="lg" />}
          <span className="flex-1">{title}</span>
          {/* {notifications && <Badge>{notifications}</Badge>} */}
        </AriaLink>
      </li>
    );
  },
);

type ItemGroupProps = ComponentPropsWithoutRef<"li"> & {
  title: string;
  icon: IconDefinition;
  notifications?: boolean;
};

const ItemGroup = forwardRef<HTMLLIElement, ItemGroupProps>(
  ({ title, icon, notifications = false, className, ...props }, ref) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <li ref={ref} {...props}>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(itemStyles({ isActive: false }), className)}
        >
          <Icon icon={icon} size="lg" fixedWidth />
          <span className="flex-1">{title}</span>
          <Icon icon={faChevronDown} className="text-muted-foreground" />
        </button>
        {expanded && (
          <ul role="list" className="my-1 ml-8 list-none space-y-1">
            {props.children}
          </ul>
        )}
      </li>
    );
  },
);

export const VerticalNavigation = {
  Nav,
  Item,
  ItemGroup,
};

export type { VerticalNavigationProps, ItemProps, ItemGroupProps };
