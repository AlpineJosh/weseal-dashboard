import { redirect } from "next/navigation";

import PageLayout from "@/components/PageLayout";
import { createSupabaseServerClient } from "@/utils/supabase/server";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }
  return <PageLayout>{children}</PageLayout>;
}
