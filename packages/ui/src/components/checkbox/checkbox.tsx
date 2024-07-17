"use client";

import React from "react";
import { faCheck } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@repo/ui";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded border ring-offset-2 focus-visible:outline-none focus-visible:ring-2 data-[state=checked]:border-none",
      "border-neutral-300 bg-white text-neutral-50 ring-primary-600 ring-offset-neutral-50 data-[state=checked]:bg-primary-600",
      "dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-50 dark:ring-primary-400 dark:ring-offset-neutral-950 dark:data-[state=checked]:bg-primary-400 dark:data-[state=checked]:text-neutral-900",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-xs")}
    >
      <FontAwesomeIcon icon={faCheck} fixedWidth />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
