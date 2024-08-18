import type { VariantProps } from "class-variance-authority";
import React from "react";
import { cva } from "class-variance-authority";
import { Button as ButtonPrimitive } from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

const buttonVariants = cva(
  cn(
    "relative inline-flex items-center justify-center gap-x-2 rounded-md",
    "whitespace-nowrap text-sm font-semibold",
    "transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  ),
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground hover:bg-muted/70",
        primary: "bg-primary text-background hover:bg-primary/80",
        secondary: "bg-secondary text-background hover:bg-secondary/80",
        accent: "bg-accent text-background hover:bg-accent/80",
        outline: "border border-input hover:bg-muted",
        ghost: "hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof ButtonPrimitive>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <ButtonPrimitive
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
