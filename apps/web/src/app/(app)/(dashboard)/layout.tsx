"use client";

import { usePathname } from "next/navigation";
import {
  faBoxes,
  faFluxCapacitor,
  faHome,
  faInboxIn,
  faInboxOut,
  faWrench,
} from "@fortawesome/pro-light-svg-icons";
import { VerticalNavigation } from "node_modules/@repo/ui/src/components/navigation/vertical-navigation";

import { cn } from "@repo/ui";
import { ResizablePanels } from "@repo/ui/components/layout";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  return (
    <ResizablePanels
      direction="horizontal"
      className="flex h-full flex-row items-stretch"
    >
      <ResizablePanels.Panel
        defaultSize={20}
        maxSize={20}
        minSize={15}
        className={cn("flex flex-col justify-stretch bg-card")}
      >
        <div className="border-neutral-200 h-16 border-b"></div>
        <div className="flex flex-col items-stretch p-4">
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
            <VerticalNavigation.ItemGroup title="Receipting" icon={faInboxIn}>
              <VerticalNavigation.Item
                href="/receipting"
                title="Overview"
                isActive={pathname === "/receipting"}
              />
              <VerticalNavigation.Item
                href="/receipting/suppliers"
                title="Suppliers"
                isActive={pathname.startsWith("/receipting/suppliers")}
              />
              <VerticalNavigation.Item
                href="/receipting/orders"
                title="Orders"
                isActive={pathname.startsWith("/receipting/order")}
              />
            </VerticalNavigation.ItemGroup>
            <VerticalNavigation.ItemGroup title="Despatching" icon={faInboxOut}>
              <VerticalNavigation.Item
                href="/despatching"
                title="Overview"
                isActive={pathname === "/despatching"}
              />
              <VerticalNavigation.Item
                href="/despatching/suppliers"
                title="Suppliers"
                isActive={pathname.startsWith("/despatching/suppliers")}
              />
              <VerticalNavigation.Item
                href="/despatching/orders"
                title="Orders"
                isActive={pathname.startsWith("/despatching/order")}
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
        </div>
      </ResizablePanels.Panel>
      <ResizablePanels.Handle withHandle />
      <ResizablePanels.Panel>
        <div className="flex h-screen flex-col items-stretch">
          <div className="h-16 flex-none border-b bg-card"></div>
          <div className="flex flex-col items-stretch overflow-auto p-6">
            {children}
          </div>
        </div>
      </ResizablePanels.Panel>
    </ResizablePanels>
  );
}
