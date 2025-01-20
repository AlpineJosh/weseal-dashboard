import React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@repo/ui/lib/class-merge";

import type { DialogProps } from "../dialog/dialog.new";
import { Dialog } from "../dialog/dialog.new";
import { usePopover } from "./popover.context";

const variants = cva(
  cn(
    // Base styles
    "isolate w-max rounded-lg",
    // Invisible border that is only visible in `forced-colors` mode for accessibility purposes
    "outline outline-1 outline-transparent focus:outline-none",
    // Handle scrolling when menu won't fit in viewport
    "overflow-y-auto",
    // Popover background
    "bg-background-popover/75 backdrop-blur-xl",
    // Shadows
    "shadow-lg ring-1 ring-content/10 dark:ring-inset",
    // Define grid at the menu level if subgrid is supported
    // Transitions
    "transition data-[closed]:data-[leave]:opacity-0 data-[leave]:duration-100 data-[leave]:ease-in",
  ),
  {
    variants: {
      isEntering: {
        true: "placement-bottom:slide-in-from-top-1 placement-top:slide-in-from-bottom-1 placement-left:slide-in-from-right-1 placement-right:slide-in-from-left-1 duration-200 ease-out animate-in fade-in",
      },
      isExiting: {
        true: "placement-bottom:slide-out-to-top-1 placement-top:slide-out-to-bottom-1 placement-left:slide-out-to-right-1 placement-right:slide-out-to-left-1 duration-150 ease-in animate-out fade-out",
      },
      placement: {
        top: "placement-top",
        bottom: "placement-bottom",
        left: "placement-left",
        right: "placement-right",
      },
    },
    defaultVariants: {
      placement: "bottom",
    },
  },
);

type PopoverProps = Omit<DialogProps, "modal">;

const Popover = ({ children, className, ...props }: PopoverProps) => {
  const { popover } = usePopover();
  return (
    <Dialog
      ref={popover.ref}
      modal={false}
      {...props}
      className={cn(variants(), className)}
      style={{ ...props.style, ...popover.styles }}
    >
      {children}
    </Dialog>
  );
};

export { Popover };
export type { PopoverProps };
