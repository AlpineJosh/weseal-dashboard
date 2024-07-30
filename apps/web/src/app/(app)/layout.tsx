"use client";

import { useState } from "react";

import { cn } from "@repo/ui";
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
      className="flex h-full flex-row items-stretch"
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
          "flex flex-col justify-stretch",
          isMenuCollapsed &&
            "min-w-[50px] transition-all duration-300 ease-in-out",
        )}
      >
        <div className="h-16 border-b border-neutral-200"></div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <div className="flex h-screen flex-col items-stretch">
          <div className="h-16 flex-none border-b border-neutral-200"></div>
          <div className="flex flex-col items-stretch overflow-auto">
            {children}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
