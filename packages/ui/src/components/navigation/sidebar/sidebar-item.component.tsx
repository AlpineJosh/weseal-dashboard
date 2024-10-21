"use client";

import { motion } from "framer-motion";
import * as Aria from "react-aria-components";

import type { LinkProps } from "../../element/link";
import { cn } from "../../../lib/class-merge";
import { Link } from "../../element/link";

type SidebarItemProps = {
  current?: boolean;
} & (LinkProps | Aria.ButtonProps);

const Item = ({ current, className, children, ...props }: SidebarItemProps) => {
  const classes = cn(
    // Base
    "text-current flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium sm:py-2 sm:text-sm/5",
    // Leading icon/icon-only
    "data-[slot=icon]:*:size-6 data-[slot=icon]:*:shrink-0 data-[slot=icon]:*:text-content-muted sm:data-[slot=icon]:*:size-5",
    // Trailing icon (down chevron or similar)
    "data-[slot=icon]:last:*:ml-auto data-[slot=icon]:last:*:size-5 sm:data-[slot=icon]:last:*:size-4",
    // Avatar
    "data-[slot=avatar]:*:-m-0.5 data-[slot=avatar]:*:size-7 data-[slot=avatar]:*:[--ring-opacity:10%] sm:data-[slot=avatar]:*:size-6",
    // Hover
    "data-[hovered]:bg-content/5 data-[slot=icon]:*:data-[hovered]:text-content",
    // Active
    "data-[active]:bg-content/5 data-[slot=icon]:*:data-[active]:text-content",
    // Current
    "data-[slot=icon]:*:data-[current]:text-content",
  );

  return (
    <span className={cn(className, "relative")}>
      {current && (
        <motion.span
          layoutId="current-indicator"
          className="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-content"
        />
      )}
      {"href" in props ? (
        <Link
          className={classes}
          {...(props as LinkProps)}
          data-current={current ? "true" : undefined}
        >
          {children as LinkProps["children"]}
        </Link>
      ) : (
        <Aria.Button
          {...(props as Aria.ButtonProps)}
          className={cn("cursor-default", classes)}
          data-current={current ? "true" : undefined}
        >
          {children as Aria.ButtonProps["children"]}
        </Aria.Button>
      )}
    </span>
  );
};

export { Item };
export type { SidebarItemProps };
