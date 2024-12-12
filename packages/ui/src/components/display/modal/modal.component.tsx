"use client";

import type { VariantProps } from "class-variance-authority";
import type { DialogProps } from "react-aria-components";
import React from "react";
import { cva } from "class-variance-authority";
import * as Aria from "react-aria-components";

import { Dialog } from "@repo/ui/components/utility";
import { cn } from "@repo/ui/lib/class-merge";

const variants = {
  overlay: cva([
    "fixed inset-0 isolate z-20 flex w-screen justify-center overflow-y-auto px-2 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-16",
    "bg-content/25 dark:bg-background/50",
    "transition duration-100 focus:outline-0 data-[closed]:opacity-0 data-[enter]:ease-out data-[leave]:ease-in",
  ]),
  modal: cva(
    [
      "row-start-2 w-full min-w-0 rounded-t-lg bg-background p-[--gutter] shadow-lg ring-1 ring-content/10 [--gutter:theme(spacing.8)] sm:mb-auto sm:rounded-lg",
      "transition duration-100 data-[closed]:translate-y-12 data-[closed]:opacity-0 data-[enter]:ease-out data-[leave]:ease-in sm:data-[closed]:translate-y-0 sm:data-[closed]:data-[enter]:scale-95",
    ],
    {
      variants: {
        size: {
          xs: "sm:max-w-xs",
          sm: "sm:max-w-sm",
          md: "sm:max-w-md",
          lg: "sm:max-w-lg",
          xl: "sm:max-w-xl",
          "2xl": "sm:max-w-2xl",
          "3xl": "sm:max-w-3xl",
          "4xl": "sm:max-w-4xl",
          "5xl": "sm:max-w-5xl",
        },
      },
      defaultVariants: {
        size: "md",
      },
    },
  ),
};

export type ModalProps = Omit<
  Aria.ModalOverlayProps,
  "children" | "className"
> &
  Pick<DialogProps, "children" | "className"> &
  VariantProps<typeof variants.modal>;

const Root = ({ className, size, children, ...props }: ModalProps) => {
  props.isDismissable ??= true;
  return (
    <Aria.ModalOverlay {...props} className={variants.overlay()}>
      <div className="fixed inset-0 w-screen overflow-y-auto pt-6 sm:pt-0">
        <div className="grid min-h-full grid-rows-[1fr_auto] justify-items-center sm:grid-rows-[1fr_auto_3fr] sm:p-4">
          <Aria.Modal {...props} className={cn(variants.modal({ size }))}>
            <Dialog.Content
              role="dialog"
              className={cn("outline-none", className)}
            >
              {children}
            </Dialog.Content>
          </Aria.Modal>
        </div>
      </div>
    </Aria.ModalOverlay>
  );
};

export const Modal = Object.assign(Root, {
  Trigger: Dialog.Trigger,
});
