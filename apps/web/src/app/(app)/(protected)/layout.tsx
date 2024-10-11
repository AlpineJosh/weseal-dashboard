"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useImmer } from "use-immer";

import {
  faBoxes,
  faHome,
  faInboxIn,
  faInboxOut,
  faMagnifyingGlass,
  faWrench,
} from "@repo/pro-light-svg-icons";
import { Button, Icon } from "@repo/ui/components/element";
import { SidebarLayout } from "@repo/ui/components/layout";
import { Sidebar } from "@repo/ui/components/navigation";

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
        <Sidebar.Item href="/receiving">
          <Icon icon={faInboxIn} />
          <Sidebar.Label>Receiving</Sidebar.Label>
        </Sidebar.Item>
        <Sidebar.Item href="/despatching">
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

  // const resetInventory = api.resetInventory.useMutation();

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
  );
}
