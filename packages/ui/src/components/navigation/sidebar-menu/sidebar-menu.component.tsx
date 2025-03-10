"use client";

import type { ComponentPropsWithoutRef } from "react";
import type { LinkProps } from "react-aria-components";
import { useCallback, useEffect, useId } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import * as Aria from "react-aria-components";
import { useImmer } from "use-immer";

import { faChevronDown, faChevronUp } from "@repo/pro-solid-svg-icons";
import { cn } from "@repo/ui/lib/class-merge";

import { Icon } from "../../element";
import { Link } from "../../utility/link";
import {
  NestingContext,
  SidebarMenuContext,
  useNestedBranch,
  useSidebarMenu,
} from "./sidebar-menu.context";

function isBranchOpen(currentBranch: string[], branch: string[]) {
  return (
    currentBranch.length >= branch.length &&
    currentBranch
      .slice(0, branch.length)
      .every((id, index) => id === branch[index])
  );
}

function isMatchingBranch(currentBranch: string[], branch: string[]) {
  return (
    currentBranch.length === branch.length &&
    currentBranch.every((id, index) => id === branch[index])
  );
}

const styles = {
  menu: cva("relative flex flex-col"),
  item: cva([
    "relative flex flex-row items-center rounded-lg",
    // Hover
    "hover:bg-content/5 data-[slot=icon]:*:hover:text-content",
    // Active
    "data-[active]:bg-content/5 data-[slot=icon]:*:data-[active]:text-content",
    "data-[slot=icon]:last:*:ml-auto data-[slot=icon]:last:*:size-5 sm:data-[slot=icon]:last:*:size-4",
  ]),
  itemContent: cva([
    "flex grow items-center gap-3 px-2 py-2.5 text-left text-base/6 font-medium text-current sm:py-2 sm:text-sm/5",
    // Leading icon/icon-only
    "data-[slot=icon]:*:text-content-muted data-[slot=icon]:*:size-6 data-[slot=icon]:*:shrink-0 sm:data-[slot=icon]:*:size-5",
    // Trailing icon (down chevron or similar)
    // Avatar
    "data-[slot=avatar]:*:-m-0.5 data-[slot=avatar]:*:size-7 data-[slot=avatar]:*:[--ring-opacity:10%] sm:data-[slot=avatar]:*:size-6",
    // Current
    "data-[slot=icon]:*:data-[current]:text-content",
  ]),
};

type SidebarMenuProps = React.ComponentPropsWithRef<"div">;

const Root = ({ children, className, ...props }: SidebarMenuProps) => {
  const [currentBranch, setCurrentBranch] = useImmer<string[]>([]);

  const toggleBranch = useCallback(
    (branch: string[]) => {
      if (isMatchingBranch(currentBranch, branch)) {
        setCurrentBranch((draft) => draft.slice(0, -1));
      } else {
        setCurrentBranch(branch);
      }
    },
    [setCurrentBranch, currentBranch],
  );

  return (
    <SidebarMenuContext.Provider value={{ currentBranch, toggleBranch }}>
      <div className={cn(styles.menu(), className)} {...props}>
        {children}
      </div>
    </SidebarMenuContext.Provider>
  );
};

type SidebarMenuItemGroupProps = React.ComponentPropsWithRef<"div">;

const ItemGroup = ({
  id,
  children,
  className,
  ...props
}: SidebarMenuItemGroupProps) => {
  const generatedId = useId();
  id = id ?? generatedId;

  const { branch } = useNestedBranch();

  return (
    <NestingContext.Provider
      value={{ branch: [...branch, id], isParent: true }}
    >
      <div className={cn("flex flex-col", className)} {...props}>
        {children}
      </div>
    </NestingContext.Provider>
  );
};

type SidebarMenuSubItemsProps = React.ComponentPropsWithRef<"div">;

const SubItems = ({
  children,
  className,
  ...props
}: SidebarMenuSubItemsProps) => {
  const { currentBranch } = useSidebarMenu();
  const { branch } = useNestedBranch();

  const isOpen = isBranchOpen(currentBranch, branch);
  if (!isOpen) return null;

  return (
    <NestingContext.Provider value={{ branch, isParent: false }}>
      <div
        className={cn(
          "relative ml-4 flex flex-col gap-y-1 pl-4",
          "before:border-content/10 before:absolute before:inset-y-0 before:left-0 before:border-l",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </NestingContext.Provider>
  );
};

type SidebarMenuItemProps = {
  current?: boolean;
} & ComponentPropsWithoutRef<"a">;

const Item = ({
  current,
  className,
  children,
  ...props
}: SidebarMenuItemProps) => {
  const { currentBranch, toggleBranch } = useSidebarMenu();
  const { branch, isParent } = useNestedBranch();
  const isOpen = isBranchOpen(currentBranch, branch);
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen && props.href && pathname.startsWith(props.href)) {
      toggleBranch(branch);
    }
  }, [isOpen, props.href, pathname, branch, toggleBranch]);

  return (
    <span className={cn(styles.item(), className)}>
      {pathname === props.href && (
        <motion.span
          layoutId="current-indicator"
          className="bg-content absolute inset-y-1 -left-4 w-0.5 rounded-full"
          style={{
            left: `-${1 + 2 * (branch.length + (isParent ? -1 : 0))}rem`,
          }}
        />
      )}
      <Link
        className={styles.itemContent()}
        {...(props as LinkProps)}
        data-current={current ? "true" : undefined}
      >
        {children}
      </Link>

      {isParent && (
        <Aria.Button
          className="aspect-square self-stretch"
          onPress={() => toggleBranch(branch)}
        >
          <Icon
            className="text-content-muted"
            icon={isOpen ? faChevronUp : faChevronDown}
          />
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

export const SidebarMenu = Object.assign(Root, {
  ItemGroup,
  Item,
  SubItems,
  Label,
});

export type {
  SidebarMenuProps,
  SidebarMenuItemProps,
  SidebarMenuItemGroupProps,
  SidebarMenuSubItemsProps,
};
