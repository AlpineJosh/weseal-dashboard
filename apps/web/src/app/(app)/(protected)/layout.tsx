import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function ProtectedLayout(props: {
  children: React.ReactNode;
}) {
  const {
    data: { session },
  } = await createClient().auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }
  return <>{props.children}</>;
}
