"use client";

import Link from "next/link";
import { signInAction } from "@/app/actions";
import { signInSchema } from "@/utils/supabase/schemas";

import { Input } from "@repo/ui/components/control";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

export default function Signin() {
  return (
    <Form
      className="flex min-w-64 flex-1 flex-col space-y-4"
      onSubmit={({ email, password }) => signInAction({ email, password })}
      schema={signInSchema}
    >
      <h1 className="text-2xl font-medium">Sign in</h1>
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="font-medium text-foreground underline" href="/sign-up">
          Sign up
        </Link>
      </p>
      <Field name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <Input placeholder="you@weseal.com" />
        </Field.Control>
      </Field>
      <Field name="password">
        <Field.Label>Password</Field.Label>
        <Field.Control>
          <Input type="password" placeholder="Your password" />
        </Field.Control>
        <Field.Description>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>
        </Field.Description>
        <Field.Message />
      </Field>
      <Button type="submit" variant="primary">
        Sign in
      </Button>
    </Form>
  );
}
