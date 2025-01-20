import type { UseFormProps as UseReactHookFormProps } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm as useReactHookForm } from "react-hook-form";

export type UseFormProps<TSchema extends z.ZodType> = Omit<
  UseReactHookFormProps<z.infer<TSchema>>,
  "resolver"
> & {
  schema: TSchema;
};

export const useForm = <TSchema extends z.ZodType>(
  props: UseFormProps<TSchema>,
) => {
  const { schema, ...formProps } = props;

  return useReactHookForm<z.infer<TSchema>>({
    ...formProps,
    resolver: zodResolver(schema),
  });
};
