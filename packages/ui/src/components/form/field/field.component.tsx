"use client";

import type { ComponentPropsWithoutRef } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { createContext, forwardRef, useContext, useId } from "react";
import { Slot } from "@radix-ui/react-slot";
import { Label as AriaLabel } from "react-aria-components";
import { useFormContext } from "react-hook-form";

import { cn } from "@repo/ui/lib/class-merge";

interface FieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  id: string;
  name: TName;
}

const FieldContext = createContext<FieldContextValue>({} as FieldContextValue);

interface FieldProps extends ComponentPropsWithoutRef<"div"> {
  name: string;
}

const useFormField = () => {
  const { name, id } = useContext(FieldContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(name, formState);

  if (!name) {
    throw new Error("useFormField should be used within <FormField>");
  }

  return {
    id,
    name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

const Root = forwardRef<HTMLDivElement, FieldProps>(
  ({ children, className, ...props }, _) => {
    const id = useId();

    props.id = props.id ?? id;
    return (
      <FieldContext.Provider value={{ id: props.id, name: props.name }}>
        <div className={cn("flex flex-col space-y-1", className)} {...props}>
          {children}
        </div>
      </FieldContext.Provider>
    );
  },
);
Root.displayName = "Field.Root";

const Label = forwardRef<
  React.ElementRef<typeof AriaLabel>,
  React.ComponentPropsWithoutRef<typeof AriaLabel>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <AriaLabel
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
Label.displayName = "Field.Label";

const Control = forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { name, error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  const { register } = useFormContext();
  const { ref: fieldRef, ...field } = register(name);

  return (
    <Slot
      ref={fieldRef}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...field}
      {...props}
    />
  );
});
Control.displayName = "Field.Control";

const Description = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-muted-foreground text-[0.8rem]", className)}
      {...props}
    />
  );
});
Description.displayName = "Field.Description";

const Message = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        "text-[0.8rem] font-medium",
        error ? "text-accent" : "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {body}
    </p>
  );
});
Message.displayName = "Field.Message";

export const Field = Object.assign(Root, {
  Label,
  Control,
  Description,
  Message,
});
