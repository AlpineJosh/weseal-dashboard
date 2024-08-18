import type { ComponentPropsWithoutRef } from "react";
import type {
  FieldValues,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";
import { forwardRef } from "react";
import { Form as AriaForm } from "react-aria-components";
import { FormProvider, useForm } from "react-hook-form";

import type { Children } from "@repo/ui/lib/helpers";
import { renderChildren } from "@repo/ui/lib/helpers";

type FormProps = Omit<
  ComponentPropsWithoutRef<typeof AriaForm>,
  "onSubmit" | "children"
> &
  UseFormProps<FieldValues> & {
    onSubmit: SubmitHandler<FieldValues>;
    children: Children<UseFormReturn<FieldValues>>;
  };
const Root = forwardRef<HTMLFormElement, FormProps>(
  ({ onSubmit, children, ...props }, ref) => {
    const form = useForm();

    return (
      <FormProvider {...form}>
        <AriaForm ref={ref} onSubmit={form.handleSubmit(onSubmit)} {...props}>
          {renderChildren(children, form)}
        </AriaForm>
      </FormProvider>
    );
  },
);

Root.displayName = "Form";

export { Root as Form };
