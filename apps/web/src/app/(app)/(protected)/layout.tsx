"use client";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { api } from "@/utils/trpc/react";
import { User } from "@supabase/supabase-js";
import { useImmer } from "use-immer";

import {
  faBoxes,
  faChevronDown,
  faFluxCapacitor,
  faHome,
  faInboxIn,
  faInboxOut,
  faMagnifyingGlass,
  faWrench,
} from "@repo/pro-light-svg-icons";
import { Button, Icon, Menu } from "@repo/ui/components/element";
import { SidebarLayout } from "@repo/ui/components/layout";
import { Sidebar } from "@repo/ui/components/navigation";

// import { ResizablePanels } from "@repo/ui/components/layout";

interface AppLayoutProps {
  children: React.ReactNode;
}

const supabase = createClient();

const Nav = () => (
  <Sidebar>
    <Sidebar.Header>We Seal Dashboard</Sidebar.Header>
    <Sidebar.Body>
      <Sidebar.Section>
        <Button className="justify-start" variant="outline">
          <Icon icon={faMagnifyingGlass} />
          Search
        </Button>
      </Sidebar.Section>
      <Sidebar.Section>
        <Sidebar.Item current href="/">
          <Icon icon={faHome} />
          <Sidebar.Label>Dashboard</Sidebar.Label>
        </Sidebar.Item>
        <Sidebar.Item href="/inventory">
          <Icon icon={faBoxes} />
          <Sidebar.Label>Inventory</Sidebar.Label>
        </Sidebar.Item>
        <Sidebar.Item href="/">
          <Icon icon={faInboxIn} />
          <Sidebar.Label>Receiving</Sidebar.Label>
        </Sidebar.Item>
        <Sidebar.Item href="/">
          <Icon icon={faInboxOut} />
          <Sidebar.Label>Despatching</Sidebar.Label>
        </Sidebar.Item>
        <Sidebar.Item href="/inventory/components">
          <Icon icon={faWrench} />
          <Sidebar.Label>Components</Sidebar.Label>
        </Sidebar.Item>
        <Sidebar.Item href="/inventory/movements">
          <Icon icon={faWrench} />
          <Sidebar.Label>Stock Movements</Sidebar.Label>
        </Sidebar.Item>
      </Sidebar.Section>
    </Sidebar.Body>
  </Sidebar>
);

export default function AppLayout({ children }: AppLayoutProps) {
  // const pathname = usePathname();

  const [user, setUser] = useImmer<User | null>(null);

  const resetInventory = api.resetInventory.useMutation();

  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();

  // if (!session) {
  //   redirect("/sign-in");
  // }

  // await supabase.auth.getUser().then(({ data }) => {
  //   setUser(data.user);
  // });

  return (
    <SidebarLayout navbar={<Nav />} sidebar={<Nav />}>
      {children}
    </SidebarLayout>
    // <div className="flex h-full flex-row items-stretch">
    //   <div className="bg-card flex w-[250px] flex-col items-stretch border-r">
    //     <div className="flex h-16 items-center justify-center border-b">
    //       <span className="text-muted-foreground text-lg font-semibold">
    //         We Seal Dashboard
    //       </span>
    //     </div>
    //     <div className="flex h-full flex-col items-stretch justify-between p-4">
    //       <VerticalNavigation.Nav>
    //         <VerticalNavigation.Item
    //           href="/"
    //           title="Dashboard"
    //           icon={faHome}
    //           isActive={pathname === "/"}
    //         />
    //         <VerticalNavigation.ItemGroup title="Inventory" icon={faBoxes}>
    //           <VerticalNavigation.Item
    //             href="/inventory"
    //             title="Overview"
    //             isActive={pathname === "/inventory"}
    //           />
    //           <VerticalNavigation.Item
    //             href="/inventory/components"
    //             title="Components"
    //             isActive={pathname.startsWith("/inventory/components")}
    //           />
    //         </VerticalNavigation.ItemGroup>
    //         <VerticalNavigation.ItemGroup title="Receiving" icon={faInboxIn}>
    //           <VerticalNavigation.Item
    //             href="/receiving"
    //             title="Overview"
    //             isActive={pathname === "/receiving"}
    //           />
    //           <VerticalNavigation.Item
    //             href="/receiving/suppliers"
    //             title="Suppliers"
    //             isActive={pathname.startsWith("/receiving/suppliers")}
    //           />
    //           <VerticalNavigation.Item
    //             href="/receiving/orders"
    //             title="PurchaseOrders"
    //             isActive={pathname.startsWith("/receiving/orders")}
    //           />
    //         </VerticalNavigation.ItemGroup>
    //         <VerticalNavigation.ItemGroup title="Despatching" icon={faInboxOut}>
    //           <VerticalNavigation.Item
    //             href="/despatching"
    //             title="Overview"
    //             isActive={pathname === "/despatching"}
    //           />
    //           {/* <VerticalNavigation.Item
    //             href="/despatching/customers"
    //             title="Customers"
    //             isActive={pathname.startsWith("/despatching/customers")}
    //           /> */}
    //           <VerticalNavigation.Item
    //             href="/despatching/orders"
    //             title="Sales Orders"
    //             isActive={pathname.startsWith("/despatching/orders")}
    //           />
    //         </VerticalNavigation.ItemGroup>
    //         {/* <VerticalNavigation.ItemGroup
    //           title="Production"
    //           icon={faFluxCapacitor}
    //         >
    //           <VerticalNavigation.Item
    //             href="/production"
    //             title="Overview"
    //             isActive={pathname === "/production"}
    //           />
    //           <VerticalNavigation.Item
    //             href="/production/jobs"
    //             title="Jobs"
    //             isActive={pathname.startsWith("/production/jobs")}
    //           />
    //         </VerticalNavigation.ItemGroup> */}
    //         {/* <VerticalNavigation.ItemGroup title="Admin" icon={faWrench}>
    //           <VerticalNavigation.Item
    //             href="/admin/users"
    //             title="Users"
    //             isActive={pathname.startsWith("/admin/users")}
    //           />
    //           <VerticalNavigation.Item
    //             href="/admin/locations"
    //             title="Locations"
    //             isActive={pathname.startsWith("/admin/locations")}
    //           />
    //           <VerticalNavigation.Item
    //             href="/admin/components"
    //             title="Components"
    //             isActive={pathname.startsWith("/admin/components")}
    //           />
    //           <VerticalNavigation.Item
    //             href="/admin/transactions"
    //             title="Transactions"
    //             isActive={pathname.startsWith("/admin/transactions")}
    //           />
    //         </VerticalNavigation.ItemGroup> */}
    //       </VerticalNavigation.Nav>
    //       <div className="flex flex-col items-center border-t p-2 text-sm">
    //         <span className="text-muted-foreground font-medium">
    //           Last Sage Sync
    //         </span>
    //         <span className="text-muted-foreground font-medium">
    //           17/09/2024 11:27
    //         </span>
    //       </div>
    //     </div>
    //   </div>
    //   <div className="flex h-screen grow flex-col items-stretch">
    //     <div className="bg-card flex h-16 flex-none flex-row items-center space-x-10 border-b px-4">
    //       {user?.email === "josh@hobson.io" && (
    //         <Button
    //           variant="accent"
    //           onPress={() => {
    //             resetInventory.mutate();
    //           }}
    //         >
    //           Reset Inventory
    //         </Button>
    //       )}
    //       <div className="flex flex-row items-center space-x-2">
    //         <div className="flex flex-col space-y-0.5 text-sm">
    //           <span className="text-muted-foreground font-semibold">
    //             {user?.email}
    //           </span>
    //         </div>
    //         <Menu icon={faChevronDown} variant={"ghost"}>
    //           <Menu.Item>Switch User</Menu.Item>
    //           <Menu.Item>Log Out</Menu.Item>
    //         </Menu>
    //       </div>
    //     </div>
    //     <div className="flex flex-col items-stretch overflow-auto p-6">
    //       {children}
    //     </div>
    //   </div>
    // </div>
  );
}
