"use server";

import type { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/utils/supabase/schemas";
import { encodedRedirect } from "@/utils/helpers";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export const signUpAction = async (data: z.infer<typeof signUpSchema>) => {
  const supabase = await createSupabaseServerClient();
  const origin = await headers().then((headers) => headers.get("origin"));

  if (!data.email || !data.password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (data: z.infer<typeof signInSchema>) => {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/");
};

export const forgotPasswordAction = async (
  data: z.infer<typeof forgotPasswordSchema>,
) => {
  const supabase = await createSupabaseServerClient();
  const origin = await headers().then((headers) => headers.get("origin"));

  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createSupabaseServerClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
