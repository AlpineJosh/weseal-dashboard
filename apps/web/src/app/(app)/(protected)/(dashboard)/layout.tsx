"use client";

import { usePathname } from "next/navigation";
import { api } from "@/utils/trpc/react";
import { VerticalNavigation } from "node_modules/@repo/ui/src/components/navigation/vertical-navigation";

import {
  faBoxes,
  faChevronDown,
  faFluxCapacitor,
  faHome,
  faInboxIn,
  faInboxOut,
  faWrench,
} from "@repo/pro-light-svg-icons";
import { cn } from "@repo/ui";
import { Input } from "@repo/ui/components/control";
import { Button, Menu } from "@repo/ui/components/element";

// import { ResizablePanels } from "@repo/ui/components/layout";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  const resetInventory = api.resetInventory.useMutation();

  return (
    <div className="flex h-full flex-row items-stretch">
      <div className="flex w-[250px] flex-col items-stretch border-r bg-card">
        <div className="flex h-16 items-center justify-center border-b">
          <span className="text-lg font-semibold text-muted-foreground">
            We Seal Dashboard
          </span>
        </div>
        <div className="flex h-full flex-col items-stretch justify-between p-4">
          <VerticalNavigation.Nav>
            <VerticalNavigation.Item
              href="/"
              title="Dashboard"
              icon={faHome}
              isActive={pathname === "/"}
            />
            <VerticalNavigation.ItemGroup title="Inventory" icon={faBoxes}>
              <VerticalNavigation.Item
                href="/inventory"
                title="Overview"
                isActive={pathname === "/inventory"}
              />
              <VerticalNavigation.Item
                href="/inventory/tasks"
                title="Tasks"
                isActive={pathname.startsWith("/inventory/tasks")}
              />
              <VerticalNavigation.Item
                href="/inventory/batch"
                title="Batch Tracing"
                isActive={pathname.startsWith("/inventory/batch")}
              />
            </VerticalNavigation.ItemGroup>
            <VerticalNavigation.ItemGroup title="Receiving" icon={faInboxIn}>
              <VerticalNavigation.Item
                href="/receiving"
                title="Overview"
                isActive={pathname === "/receiving"}
              />
              <VerticalNavigation.Item
                href="/receiving/suppliers"
                title="Suppliers"
                isActive={pathname.startsWith("/receiving/suppliers")}
              />
              <VerticalNavigation.Item
                href="/receiving/orders"
                title="Orders"
                isActive={pathname.startsWith("/receiving/orders")}
              />
            </VerticalNavigation.ItemGroup>
            <VerticalNavigation.ItemGroup title="Despatching" icon={faInboxOut}>
              <VerticalNavigation.Item
                href="/despatching"
                title="Overview"
                isActive={pathname === "/despatching"}
              />
              <VerticalNavigation.Item
                href="/despatching/customers"
                title="Customers"
                isActive={pathname.startsWith("/despatching/customers")}
              />
              <VerticalNavigation.Item
                href="/despatching/orders"
                title="Orders"
                isActive={pathname.startsWith("/despatching/orders")}
              />
            </VerticalNavigation.ItemGroup>
            <VerticalNavigation.ItemGroup
              title="Production"
              icon={faFluxCapacitor}
            >
              <VerticalNavigation.Item
                href="/production"
                title="Overview"
                isActive={pathname === "/production"}
              />
              <VerticalNavigation.Item
                href="/production/jobs"
                title="Jobs"
                isActive={pathname.startsWith("/production/jobs")}
              />
            </VerticalNavigation.ItemGroup>
            <VerticalNavigation.ItemGroup title="Admin" icon={faWrench}>
              <VerticalNavigation.Item
                href="/admin/users"
                title="Users"
                isActive={pathname.startsWith("/admin/users")}
              />
              <VerticalNavigation.Item
                href="/admin/locations"
                title="Locations"
                isActive={pathname.startsWith("/admin/locations")}
              />
              <VerticalNavigation.Item
                href="/admin/components"
                title="Components"
                isActive={pathname.startsWith("/admin/components")}
              />
              <VerticalNavigation.Item
                href="/admin/transactions"
                title="Transactions"
                isActive={pathname.startsWith("/admin/transactions")}
              />
            </VerticalNavigation.ItemGroup>
          </VerticalNavigation.Nav>
          <div className="flex flex-col items-center border-t p-2 text-sm">
            <span className="font-medium text-muted-foreground">
              Last Sage Sync
            </span>
            <span className="font-medium text-accent">1/9/2024 10:27</span>
          </div>
        </div>
      </div>
      <div className="flex h-screen grow flex-col items-stretch">
        <div className="flex h-16 flex-none flex-row items-center space-x-10 border-b bg-card px-4">
          <Button
            variant="accent"
            onPress={() => {
              resetInventory.mutate();
            }}
          >
            Reset Inventory
          </Button>
          <div className="flex flex-row items-center space-x-2">
            <div className="flex flex-col space-y-0.5 text-sm">
              <span className="font-semibold text-muted-foreground">
                Josh Hobson
              </span>
              <span className="font-light text-muted-foreground">
                josh.hobson@weseal.com
              </span>
            </div>
            <Menu icon={faChevronDown} variant={"ghost"}>
              <Menu.Item>Switch User</Menu.Item>
              <Menu.Item>Log Out</Menu.Item>
            </Menu>
          </div>
        </div>
        <div className="flex flex-col items-stretch overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
