"use client";

import type { ComponentPropsWithoutRef } from "react";
import type { Form as AriaForm } from "react-aria-components";
import type {
  FieldValues,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";
import type { ZodSchema } from "zod";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import type { Children } from "@repo/ui/lib/helpers";
import { renderChildren } from "@repo/ui/lib/helpers";

type FormProps<T extends FieldValues> = Omit<
  ComponentPropsWithoutRef<typeof AriaForm>,
  "onSubmit" | "children"
> & {
  onSubmit: SubmitHandler<T>;
  form: UseFormReturn<T>;
  children: Children<UseFormReturn<T>>;
};

const Form = <T extends FieldValues>({
  onSubmit,
  form,
  children,
  ...props
}: FormProps<T>) => {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
        {renderChildren(children, form)}
      </form>
    </FormProvider>
  );
};

type ManagedFormProps<T extends FieldValues> = Omit<
  ComponentPropsWithoutRef<typeof AriaForm>,
  "onSubmit" | "children"
> &
  UseFormProps<T> & {
    onSubmit: SubmitHandler<T>;
    schema: ZodSchema<T>;
    children: Children<UseFormReturn<T>>;
  };

const ManagedForm = <T extends FieldValues>({
  onSubmit,
  defaultValues,
  schema,
  children,
  ...props
}: ManagedFormProps<T>) => {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  return (
    <Form form={form} onSubmit={onSubmit} {...props}>
      {children}
    </Form>
  );
};

export { Form, ManagedForm };
export type { FormProps, ManagedFormProps };
