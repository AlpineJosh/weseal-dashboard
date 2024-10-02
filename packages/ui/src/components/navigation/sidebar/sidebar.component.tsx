"use client";

import React, { Fragment, useId } from "react";
import { LayoutGroup, motion } from "framer-motion";
import * as Aria from "react-aria-components";
import { useImmer } from "use-immer";

import { cn } from "../../../lib/class-merge";
import { Link, LinkProps } from "../../element/link";

type SidebarProps = React.ComponentPropsWithRef<"nav">;

const Root = ({ className, ...props }: SidebarProps) => {
  return (
    <nav {...props} className={cn(className, "flex h-full min-h-0 flex-col")} />
  );
};

const Header = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) => {
  return (
    <div
      {...props}
      className={cn(
        className,
        "flex flex-col border-b border-content/5 p-4 [&>[data-slot=section]+[data-slot=section]]:mt-2.5",
      )}
    />
  );
};

const Body = ({ className, ...props }: React.ComponentPropsWithRef<"div">) => {
  return (
    <div
      {...props}
      className={cn(
        className,
        "flex flex-1 flex-col overflow-y-auto p-4 [&>[data-slot=section]+[data-slot=section]]:mt-8",
      )}
    />
  );
};

const Footer = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) => {
  return (
    <div
      {...props}
      className={cn(
        className,
        "flex flex-col border-t border-content/5 p-4 [&>[data-slot=section]+[data-slot=section]]:mt-2.5",
      )}
    />
  );
};

const Section = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) => {
  let id = useId();

  return (
    <LayoutGroup id={id}>
      <div
        {...props}
        data-slot="section"
        className={cn(className, "flex flex-col gap-0.5")}
      />
    </LayoutGroup>
  );
};

const Divider = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"hr">) => {
  return (
    <hr
      {...props}
      className={cn(className, "my-4 border-t border-content/5 lg:-mx-4")}
    />
  );
};

const Spacer = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) => {
  return (
    <div
      aria-hidden="true"
      {...props}
      className={cn(className, "mt-8 flex-1")}
    />
  );
};

const Heading = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"h3">) => {
  return (
    <h3
      {...props}
      className={cn(
        className,
        "mb-1 px-2 text-xs font-medium text-content-muted",
      )}
    />
  );
};

type SidebarItemProps = {
  current?: boolean;
} & (LinkProps | Aria.ButtonProps);

const Item = ({ current, className, children, ...props }: SidebarItemProps) => {
  let classes = cn(
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
          {...props}
          data-current={current ? "true" : undefined}
        >
          {children}
        </Link>
      ) : (
        <Aria.Button
          {...props}
          className={cn("cursor-default", classes)}
          data-current={current ? "true" : undefined}
        >
          {children}
        </Aria.Button>
      )}
    </span>
  );
};

const Label = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"span">) => {
  return <span {...props} className={cn(className, "truncate")} />;
};

export const Sidebar = Object.assign(Root, {
  Header,
  Body,
  Footer,
  Section,
  Divider,
  Spacer,
  Heading,
  Item,
  Label,
});

export type { SidebarItemProps, SidebarProps };
