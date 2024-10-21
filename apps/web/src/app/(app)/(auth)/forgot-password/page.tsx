"use client";

import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions";
import { forgotPasswordSchema } from "@/utils/supabase/schemas";

import { Input } from "@repo/ui/components/control";
import { Button } from "@repo/ui/components/element";
import { Field, ManagedForm } from "@repo/ui/components/form";

export default function ForgotPassword() {
  return (
    <ManagedForm
      className="flex min-w-64 flex-1 flex-col space-y-4"
      onSubmit={(data) => forgotPasswordAction(data)}
      schema={forgotPasswordSchema}
    >
      <h1 className="text-2xl font-medium">Reset Password</h1>
      <p className="text text-foreground text-sm">
        Already have an account?{" "}
        <Link className="font-medium text-primary underline" href="/sign-in">
          Sign in
        </Link>
      </p>

      <Field name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <Input type="email" placeholder="you@weseal.com" />
        </Field.Control>
        <Field.Message />
      </Field>

      <Button type="submit" variant="solid">
        Reset Password
      </Button>
    </ManagedForm>
  );
}
