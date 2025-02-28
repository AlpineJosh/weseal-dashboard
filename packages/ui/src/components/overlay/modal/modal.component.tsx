"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithRef } from "react";
import { FloatingOverlay, FloatingPortal } from "@floating-ui/react";
import { cva } from "class-variance-authority";

import type { FloatingChildren } from "../floating/floating.context";
import {
  Floating,
  useFloatingControls,
  useFloatingProps,
} from "../floating/floating.context";

const variants = {
  backdrop: cva([
    "fixed inset-0 isolate z-10 overflow-y-auto px-2 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-16",
    "grid min-h-full grid-rows-[1fr_auto] justify-items-center sm:grid-rows-[1fr_auto_3fr] sm:p-4",
    "bg-content/25 dark:bg-background/50 transition-opacity duration-200 focus:outline-0",
    "ending:ease-in ending:opacity-0 starting:opacity-0 starting:ease-out",
  ]),
  container: cva(["z-20 row-start-2"], {
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
  }),
  modal: cva([
    "bg-panel ring-content/10 row-start-2 w-full min-w-0 rounded-t-lg shadow-lg transition-all duration-200 sm:mb-auto sm:rounded-lg",
    "ending:translate-y-12 ending:opacity-0 ending:ease-in sm:ending:translate-y-0 sm:ending:scale-95",
    "starting:translate-y-12 starting:opacity-0 starting:ease-out sm:starting:translate-y-0 sm:starting:scale-95",
  ]),
};

export interface ModalProps {
  children: FloatingChildren;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean | undefined) => void;
}

export const Modal = ({ children, isOpen, onOpenChange }: ModalProps) => {
  const controls = useFloatingControls({
    isOpen,
    onOpenChange,
  });

  return (
    <Floating
      open={controls.isOpen}
      onOpenChange={controls.onOpenChange}
      click={{ enabled: true, toggle: false }}
      dismiss={{ enabled: true }}
      transition={{ duration: 200 }}
    >
      {children}
    </Floating>
  );
};

export type ModalPaneProps = ComponentPropsWithRef<"div"> &
  VariantProps<typeof variants.container> & {
    children: FloatingChildren;
  };

export const ModalPane = ({ children, size, ...props }: ModalPaneProps) => {
  const { controls, getProps, setRef, isMounted, transitionState } =
    useFloatingProps();
  return !isMounted ? null : (
    <FloatingPortal>
      <FloatingOverlay
        data-ending={transitionState === "close"}
        lockScroll={true}
        className={variants.backdrop()}
      >
        <div
          {...getProps()}
          ref={setRef}
          className={variants.container({ size })}
        >
          <div
            data-ending={transitionState === "close"}
            className={variants.modal()}
            {...props}
          >
            {typeof children === "function" ? children(controls) : children}
          </div>
        </div>
      </FloatingOverlay>
    </FloatingPortal>
  );
};
