import { redirect } from "next/navigation";
import { NavigationMenu } from "@/components/NavigationMenu";
import { createClient } from "@/utils/supabase/server";

import { faMagnifyingGlass } from "@repo/pro-light-svg-icons";
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
        <NavigationMenu />
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
