"use client";

import { useState } from "react";
import Link from "next/link";

import { cn } from "@repo/ui";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@repo/ui/components/horizontal-navigation/horizontal-navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/ui/components/resizable/resizable";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full items-stretch"
    >
      <ResizablePanel
        defaultSize={265}
        maxSize={20}
        minSize={15}
        collapsible
        collapsedSize={4}
        onCollapse={() => setIsMenuCollapsed(true)}
        onExpand={() => setIsMenuCollapsed(false)}
        className={cn(
          isMenuCollapsed &&
            "min-w-[50px] transition-all duration-300 ease-in-out",
        )}
      >
        <NavigationMenu orientation="vertical" className="w-full p-4">
          <NavigationMenuList className="flex w-full flex-col gap-2">
            <NavigationMenuItem>
              <Link href="/" passHref legacyBehavior>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/" passHref legacyBehavior>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Stock Components
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <div>{children}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
