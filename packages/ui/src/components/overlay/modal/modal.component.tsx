"use client";

import type { DialogProps, ModalOverlayProps } from "react-aria-components";
import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import {
  Dialog,
  DialogTrigger,
  ModalOverlay,
  Modal as ModalPrimitive,
} from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

export type ModalProps = ModalOverlayProps;

const overlayStyles = cva(
  cn(
    "fixed inset-0 isolate z-20 flex items-center justify-center bg-foreground/80 p-4 text-center backdrop-blur-lg",
  ),
  {
    variants: {
      isEntering: {
        true: "duration-200 ease-out animate-in fade-in",
      },
      isExiting: {
        true: "duration-200 ease-in animate-out fade-out",
      },
    },
  },
);

const modalStyles = cva(
  "text-popover-foreground max-screen-w-md flex max-h-full flex-col rounded-lg bg-card bg-clip-padding text-left align-middle shadow-2xl",
  {
    variants: {
      isEntering: {
        true: "duration-200 ease-out animate-in zoom-in-105",
      },
      isExiting: {
        true: "duration-200 ease-in animate-out zoom-out-95",
      },
    },
  },
);

const Content = forwardRef<HTMLDivElement, DialogProps>(
  ({ className, ...props }, ref) => {
    return (
      <ModalOverlay
        className={({ isEntering, isExiting }) =>
          overlayStyles({ isEntering, isExiting })
        }
      >
        <ModalPrimitive
          className={({ isEntering, isExiting }) =>
            cn(modalStyles({ isEntering, isExiting }), className)
          }
          ref={ref}
        >
          <Dialog {...props} />
        </ModalPrimitive>
      </ModalOverlay>
    );
  },
);

export const Modal = Object.assign(DialogTrigger, {
  Content,
});
