"use client";

import type { ComponentPropsWithoutRef } from "react";
import type { Form as AriaForm } from "react-aria-components";
import type {
  FieldValues,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import { FormProvider } from "react-hook-form";

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

export { Form };
export type { FormProps };
