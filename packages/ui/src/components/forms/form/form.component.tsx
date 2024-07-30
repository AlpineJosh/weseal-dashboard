import type { Children } from "@/lib/helpers";
import type { ComponentPropsWithoutRef } from "react";
import type {
  FieldValues,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";
import { forwardRef } from "react";
import { renderChildren } from "@/lib/helpers";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";

type FormProps = Omit<
  ComponentPropsWithoutRef<typeof Form>,
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
      <Form ref={ref} onSubmit={form.handleSubmit(onSubmit)} {...props}>
        {renderChildren(children, form)}
      </Form>
    );
  },
);

Root.displayName = "Form";

export { Root as Form };
