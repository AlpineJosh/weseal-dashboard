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

// import { ResizablePanels } from "@repo/ui/components/layout";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-row items-stretch">
      <div className="flex w-[200px] flex-col items-stretch border-r bg-card">
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
        </div>
      </div>
      <div className="flex h-screen grow flex-col items-stretch">
        <div className="h-16 flex-none border-b bg-card"></div>
        <div className="flex flex-col items-stretch overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
