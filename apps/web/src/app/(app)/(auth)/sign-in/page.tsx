"use client";

import { signInAction } from "@/app/actions";
import { signInSchema } from "@/utils/supabase/schemas";

import { Input } from "@repo/ui/components/control";
import { Button } from "@repo/ui/components/element";
import { Field, FieldGroup, ManagedForm } from "@repo/ui/components/form";
import { Heading, Text, TextLink } from "@repo/ui/components/typography";

export default function Signin({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error;

  return (
    <ManagedForm
      className="flex min-w-64 flex-1 flex-col space-y-2"
      onSubmit={({ email, password }) => {
        void signInAction({ email, password });
      }}
      schema={signInSchema}
    >
      <Heading>Sign in</Heading>
      <FieldGroup>
        <Field name="email">
          <Field.Label>Email</Field.Label>
          <Field.Control>
            <Input type="email" placeholder="you@weseal.com" />
          </Field.Control>
          <Field.Message />
        </Field>
        <Field name="password">
          <Field.Label>Password</Field.Label>
          <Field.Control>
            <Input type="password" placeholder="Your password" />
          </Field.Control>
          <Field.Message />
        </Field>
      </FieldGroup>

      <TextLink className="block text-sm" href="/forgot-password">
        Forgot Password?
      </TextLink>
      {error && (
        <Text className="block text-sm text-destructive">
          {error === "Invalid login credentials"
            ? "Invalid email or password"
            : "Something went wrong"}
        </Text>
      )}
      <Button type="submit" color="primary" variant="solid" className="w-full">
        Sign in
      </Button>
      <Text>
        Don't have an account? <TextLink href="/sign-up">Sign up</TextLink>
      </Text>
    </ManagedForm>
  );
}
