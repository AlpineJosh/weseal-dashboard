import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default async function ProtectedLayout(props: {
  children: React.ReactNode;
}) {
  const {
    data: { session },
  } = await createClient().auth.getSession();
  console.log("session", session);

  return <>{props.children}</>;
}
