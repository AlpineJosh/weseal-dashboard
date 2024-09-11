"use client";

import type { ComponentPropsWithoutRef } from "react";
import type {
  FieldValues,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";
import type { ZodSchema } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form as AriaForm } from "react-aria-components";
import { FormProvider, useForm } from "react-hook-form";

import type { Children } from "@repo/ui/lib/helpers";
import { renderChildren } from "@repo/ui/lib/helpers";

type FormProps<T extends FieldValues> = Omit<
  ComponentPropsWithoutRef<typeof AriaForm>,
  "onSubmit" | "children"
> &
  UseFormProps<T> & {
    onSubmit: SubmitHandler<T>;
    children: Children<UseFormReturn<T>>;
    schema: ZodSchema<T>;
  };

const Root = <T extends FieldValues>({
  onSubmit,
  schema,
  defaultValues,
  children,
  ...props
}: FormProps<T>) => {
  const form = useForm<T>({ resolver: zodResolver(schema), defaultValues });

  return (
    <FormProvider {...form}>
      <AriaForm onSubmit={form.handleSubmit(onSubmit)} {...props}>
        {renderChildren(children, form)}
      </AriaForm>
    </FormProvider>
  );
};

Root.displayName = "Form";

export { Root as Form };
