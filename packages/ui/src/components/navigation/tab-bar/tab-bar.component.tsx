"use client";

import { usePathname } from "next/navigation";
import { cva } from "class-variance-authority";

import { cn } from "@repo/ui/lib/class-merge";

import type { LinkProps } from "../../element";
import { Link } from "../../element";

const variants = {
  tabbar: cva("flex w-full flex-row space-x-2 border-b border-content/10"),
  tab: cva(
    [
      "-mb-px flex flex-row border-b-2 border-transparent px-4 py-3",
      "text-sm font-medium text-content-muted",
      "hover:border-content/20 hover:text-content",
    ],
    {
      variants: {
        isActive: {
          true: "border-primary text-content hover:border-primary",
          false: "",
        },
      },
    },
  ),
};

interface TabBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
const Root = ({ children, className, ...props }: TabBarProps) => {
  return (
    <div className={cn(variants.tabbar(), className)} {...props}>
      {children}
    </div>
  );
};

interface TabProps extends LinkProps {
  children: React.ReactNode;
  isActive?: boolean;
}

const Tab = ({ children, className, isActive, ...props }: TabProps) => {
  const pathname = usePathname();

  isActive = isActive ?? pathname === props.href;

  return (
    <Link className={cn(variants.tab({ isActive }), className)} {...props}>
      {children}
    </Link>
  );
};

export const TabBar = Object.assign(Root, {
  Tab,
});

export type { TabBarProps, TabProps };
