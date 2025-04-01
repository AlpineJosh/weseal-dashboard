import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export const seedUsers = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: "josh.hobson@weseal.com",
    password: "admin",
    options: {
      data: {
        name: "Josh Hobson",
      },
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Failed to seed user");
  }

  return data.user.id;
};
