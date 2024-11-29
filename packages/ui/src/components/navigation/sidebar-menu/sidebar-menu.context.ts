"use client";

import { createContext, useContext } from "react";

interface SidebarMenuContextType {
  currentBranch: string[];
  toggleBranch: (branch: string[]) => void;
}

export const SidebarMenuContext = createContext<SidebarMenuContextType | null>(
  null,
);

export function useSidebarMenu() {
  const context = useContext(SidebarMenuContext);
  if (!context) {
    throw new Error("useSidebarMenu must be used within a SidebarMenuProvider");
  }
  return context;
}

interface NestingContextType {
  branch: string[];
  isParent: boolean;
}

export const NestingContext = createContext<NestingContextType>({
  branch: [],
  isParent: false,
});

export function useNestedBranch() {
  const context = useContext(NestingContext);

  return context;
}
