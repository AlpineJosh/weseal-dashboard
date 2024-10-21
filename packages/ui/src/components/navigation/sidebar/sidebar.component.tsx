import React, { useId } from "react";
import { LayoutGroup } from "framer-motion";

import type { SidebarItemProps } from "./sidebar-item.component";
import { cn } from "../../../lib/class-merge";
import { Item } from "./sidebar-item.component";

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
  const id = useId();

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
