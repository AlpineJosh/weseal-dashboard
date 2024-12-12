import { redirect } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import { createClient } from "@/utils/supabase/server";

interface AppLayoutProps {
  children: React.ReactNode;
}

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
      <PageLayout>{children}</PageLayout>
    </Authenticated>
  );
}
