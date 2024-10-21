import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

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

const Authenticated = async ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return <>{children}</>;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Authenticated>
      <SidebarLayout navbar={<Nav />} sidebar={<Nav />}>
        {children}
      </SidebarLayout>
    </Authenticated>
  );
}
