"use client";

import Link from "next/link";
import { signUpAction } from "@/app/actions";
import { signUpSchema } from "@/utils/supabase/schemas";

import { Input } from "@repo/ui/components/control";
import { Button } from "@repo/ui/components/element";
import { Field, Form } from "@repo/ui/components/form";

export default function Signup() {
  return (
    <Form
      className="flex min-w-64 flex-1 flex-col space-y-4"
      onSubmit={({ email, password }) => signUpAction({ email, password })}
      schema={signUpSchema}
    >
      <h1 className="text-2xl font-medium">Sign up</h1>
      <p className="text text-sm text-foreground">
        Already have an account?{" "}
        <Link className="font-medium text-primary underline" href="/sign-in">
          Sign in
        </Link>
      </p>

      <Field name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <Input placeholder="you@weseal.com" />
        </Field.Control>
        <Field.Message />
      </Field>
      <Field name="password">
        <Field.Label>Password</Field.Label>
        <Field.Control>
          <Input type="password" placeholder="Your password" />
        </Field.Control>
        <Field.Message>
          Password must be at least 8 characters long
        </Field.Message>
      </Field>

      <Button type="submit" variant="primary">
        Sign up
      </Button>
    </Form>
  );
}
