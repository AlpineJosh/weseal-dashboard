import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithRef } from "react";
import { cva } from "class-variance-authority";

const variants = cva(
  [
    // Base layout
    "relative block w-full overflow-hidden",

    "bg-background dark:bg-content/5",

    // Background and shadow (before pseudo)
    "before:absolute before:inset-px before:rounded-lg before:bg-white before:shadow",
    "dark:before:hidden",

    // Focus ring (after pseudo)
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent sm:after:focus-within:ring-2 sm:after:focus-within:ring-ring",

    // Border styling and states
    "rounded-lg border border-content/10 hover:border-content/20",
    "has-[[data-invalid]]:border-destructive/50 has-[[data-invalid]]:after:focus-within:ring-destructive has-[[data-invalid]]:hover:border-destructive",
    "has-[[data-disabled]]:opacity-50 has-[[data-disabled]]:before:bg-content/5 has-[[data-disabled]]:before:shadow-none has-[[data-disabled]]:dark:before:bg-white/5",

    // Common spacing
    "[&>*]:px-3.5 [&>*]:py-2.5",

    // Common text styling
    "[&>*]:text-base/6 [&>*]:text-content [&>*]:placeholder:text-content-muted",
  ],
  {
    variants: {
      scale: {
        sm: "[&>*]:px-3 [&>*]:py-2 [&>*]:text-sm",
        md: "", // default size
        lg: "[&>*]:px-4 [&>*]:py-3 [&>*]:text-lg",
      },
    },
    defaultVariants: {
      scale: "md",
    },
  },
);

export type InputProps = ComponentPropsWithRef<"span"> &
  VariantProps<typeof variants>;

export function Input({ children, scale, className, ...props }: InputProps) {
  return (
    <span
      data-slot="input"
      className={variants({ scale, className })}
      {...props}
    >
      {children}
    </span>
  );
}

export interface InputTypeProps<TValue>
  extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "onBlur"> {
  name: string;
  value?: TValue;
  onChange?: (value?: TValue) => void;
  onBlur?: () => void;
  defaultValue?: TValue;
  disabled?: boolean;
  invalid?: boolean;
}
