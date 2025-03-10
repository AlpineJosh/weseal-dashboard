import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithRef } from "react";
import { cva } from "class-variance-authority";

const variants = cva(
  [
    // Base layout
  ],
  {
    variants: {
      variant: {
        box: [
          "relative block w-full",
          "bg-panel border-content/10 hover:border-content/20 rounded-lg border",
          "inset-ring-primary-strong inset-ring-0 shadow-sm",

          "focus-within:inset-ring-primary-strong focus-within:border-primary-strong/100 focus-within:hover:border-primary-strong/100 focus-within:inset-ring-1 focus-within:shadow-sm",
          "invalid-within:border-destructive-strong/50 invalid-within:inset-ring-destructive-strong invalid-within:focus-within:border-destructive-strong/100",
          "disabled-within:bg-content/5 disabled-within:opacity-50 disabled-within:shadow-none disabled-within:hover:border-content/10",

          // Common spacing
          "[&>*]:py-2xs [&>*]:px-xs",

          // Common text styling
          "text-content [&>*]:placeholder:text-content/30 text-base/6",
        ],
        inline: "",
      },
    },
    defaultVariants: {
      variant: "box",
    },
  },
);

export type InputTypeProps<TValue> = Omit<
  ComponentPropsWithRef<"input">,
  "value" | "defaultValue" | "onChange" | "onBlur"
> & {
  name: string;
  value?: TValue;
  onChange?: (value?: TValue) => void;
  onBlur?: () => void;
  defaultValue?: TValue;
  disabled?: boolean;
  "data-invalid"?: boolean;
};

export type InputProps = ComponentPropsWithRef<"span"> &
  VariantProps<typeof variants>;

export function Input({ children, className, variant, ...props }: InputProps) {
  return (
    <span
      data-slot="input"
      className={variants({ variant, className })}
      {...props}
    >
      {children}
    </span>
  );
}
