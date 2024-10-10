"use client";

import type { VariantProps } from "class-variance-authority";
import React from "react";
import { cva } from "class-variance-authority";
import * as Aria from "react-aria-components";

import { cn } from "../../../lib/class-merge";
import { colorVariants } from "../../../lib/colors";
import { Link, LinkProps } from "../link";

const variants = cva(
  [
    // Base
    "text-red relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-base font-semibold",
    // Sizing
    "px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing.3)-1px)] sm:py-[calc(theme(spacing[1.5])-1px)] sm:text-sm/6",
    // Focus
    "data-[focus]:outline-outline focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2",
    // Disabled
    "data-[disabled]:opacity-50",
    // Icon
    "[&>[data-slot=icon]]:-mx-0.5 [&>[data-slot=icon]]:my-0.5 [&>[data-slot=icon]]:size-4 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:sm:my-1 [&>[data-slot=icon]]:sm:size-3",
  ],
  {
    variants: {
      variant: {
        solid: [
          // Optical border, implemented as the button background to avoid corner artifacts
          "border-transparent bg-color-border text-background",
          // Dark mode: border is rendered on `after` so background is set to button background
          "dark:bg-color",
          // Button background, implemented as foreground layer to stack on top of pseudo-border layer
          "before:absolute before:inset-0 before:-z-10 before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-color",
          // Drop shadow, applied to the inset `before` layer so it blends with the border
          "before:shadow",
          // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
          "dark:before:hidden",
          // Dark mode: Subtle white outline is applied using a border
          "dark:border-white/5",
          // Shim/overlay, inset to match button foreground and used for hover state + highlight shadow
          "after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.lg)-1px)]",
          // Inner highlight shadow
          "after:shadow-[shadow:inset_0_1px_theme(colors.white/15%)]",
          // White overlay on hover
          "after:data-[active]:bg-white/10 after:data-[hovered]:bg-white/10",
          // Dark mode: `after` layer expands to cover entire button
          "dark:after:-inset-px dark:after:rounded-lg",
          // Disabled
          "before:data-[disabled]:shadow-none after:data-[disabled]:shadow-none",
          "[&>[data-slot=icon]]:text-[--btn-icon]",
        ],
        outline: [
          // Base
          "data-[active]:bg-color/5] border-color-border text-color-text data-[hovered]:bg-color/5",
          // Dark mode
          "dark:border-white/15 dark:text-white dark:[--btn-bg:transparent] dark:data-[active]:bg-white/5 dark:data-[hover]:bg-white/5",
          // Icon
        ],
        plain: [
          // Base
          "border-transparent text-color-text data-[active]:bg-color/5 data-[hovered]:bg-color/5",
          // Dark mode
          "dark:text-white dark:data-[active]:bg-white/10 dark:data-[hovered]:bg-white/10",
          // Icon
          "[--btn-icon:--text-muted] data-[active]:[--btn-icon:--color-text] data-[hover]:[--btn-icon:theme(--color-text)]",
        ],
        input: [
          // Optical border, implemented as the button background to avoid corner artifacts
          "border-transparent bg-background-muted font-normal text-content-muted",
          // Dark mode: border is rendered on `after` so background is set to button background
          "dark:bg-color",
          // Button background, implemented as foreground layer to stack on top of pseudo-border layer
          "before:absolute before:inset-0 before:-z-10 before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-background",
          // Drop shadow, applied to the inset `before` layer so it blends with the border
          "before:shadow",
          // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
          "dark:before:hidden",
          // Dark mode: Subtle white outline is applied using a border
          "dark:border-content/5",
          // Shim/overlay, inset to match button foreground and used for hover state + highlight shadow
          "after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.lg)-1px)]",
          // Inner highlight shadow
          "after:shadow-[shadow:inset_0_1px_theme(colors.white/15%)]",
          // White overlay on hover
          "after:data-[active]:bg-background/10 after:data-[hovered]:bg-background/10",
          // Dark mode: `after` layer expands to cover entire button
          "dark:after:-inset-px dark:after:rounded-lg",
          // Disabled
          "before:data-[disabled]:shadow-none after:data-[disabled]:shadow-none",
          "[&>[data-slot=icon]]:text-[--btn-icon]",
          "border border-content/5 data-[hovered]:border-content/10",
        ],
      },
      color: colorVariants,
    },
    defaultVariants: {
      variant: "solid",
      color: "default",
    },
  },
);

// const buttonVariants = cva(
//   cn(
//     "relative inline-flex items-center justify-center gap-x-2 rounded-md",
//     "whitespace-nowrap text-sm font-semibold",
//     "transition-colors",
//     "disabled:pointer-events-none disabled:opacity-50",
//     "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
//   ),
//   {
//     variants: {
//       variant: {
//         default: "bg-muted text-foreground hover:bg-muted/70",
//         primary: "bg-primary hover:bg-primary/80 text-background",
//         secondary: "bg-secondary hover:bg-secondary/80 text-background",
//         accent: "bg-accent hover:bg-accent/80 text-background",
//         outline: "border-input hover:bg-muted border",
//         ghost: "hover:bg-muted",
//         link: "text-primary underline-offset-4 hover:underline",
//       },
//       size: {
//         default: "h-9 px-4 py-2",
//         sm: "h-8 rounded-md px-3 text-xs",
//         lg: "h-10 rounded-md px-8",
//         icon: "h-9 w-9",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default",
//     },
//   },
// );

type ButtonProps = VariantProps<typeof variants> &
  (Aria.ButtonProps | LinkProps);

const Button = ({
  variant,
  color,
  className,
  ...props
}: ButtonProps): React.ReactElement => {
  return "href" in props && props.href ? (
    <Link
      className={cn(variants({ variant, color }), className)}
      {...(props as LinkProps)}
    />
  ) : (
    <Aria.Button
      className={cn(variants({ variant, color }), className)}
      {...(props as Aria.ButtonProps)}
    />
  );
};

export { Button };
export type { ButtonProps };
