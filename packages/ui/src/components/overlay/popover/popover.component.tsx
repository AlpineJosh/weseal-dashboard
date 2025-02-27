import type { Placement, Strategy } from "@floating-ui/react-dom";
import type { MutableRefObject } from "react";
import React from "react";
import { useFloating } from "@floating-ui/react-dom";
import { cva } from "class-variance-authority";

import { cn } from "@repo/ui/lib/class-merge";

import type { OverlayChildren } from "../overlay/overlay.component";
import { Overlay } from "../overlay/overlay.component";

const variants = cva(
  cn(
    // Base styles
    "isolate w-max rounded-lg",
    // Invisible border that is only visible in `forced-colors` mode for accessibility purposes
    "outline outline-1 outline-transparent focus:outline-none",
    // Handle scrolling when menu won't fit in viewport
    "overflow-y-auto",
    // Popover background
    // "bg-background-popover/75 backdrop-blur-xl",
    // Shadows
    "ring-content/10 ring-1 shadow-lg dark:ring-inset",
    // Define grid at the menu level if subgrid is supported
    // Transitions
    "backdrop:bg-content/10 transition data-[leave]:duration-100 data-[leave]:ease-in data-[closed]:data-[leave]:opacity-0",
  ),
  {
    variants: {
      isEntering: {
        true: "placement-bottom:slide-in-from-top-1 placement-top:slide-in-from-bottom-1 placement-left:slide-in-from-right-1 placement-right:slide-in-from-left-1 animate-in fade-in duration-200 ease-out",
      },
      isExiting: {
        true: "placement-bottom:slide-out-to-top-1 placement-top:slide-out-to-bottom-1 placement-left:slide-out-to-right-1 placement-right:slide-out-to-left-1 animate-out fade-out duration-150 ease-in",
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

interface PopoverProps {
  children: OverlayChildren;
  placement?: Placement;
  strategy?: Strategy;
}

const Popover = ({ children, placement, strategy }: PopoverProps) => {
  const { refs, floatingStyles } = useFloating({
    placement,
    strategy,
  });

  return (
    <Overlay
      isModal={false}
      trigger={{
        ref: refs.reference,
        setReference: refs.setReference,
      }}
      sheet={{
        ref: refs.floating as MutableRefObject<HTMLDialogElement | null>,
        setReference: refs.setFloating,
        styles: floatingStyles,
        className: variants({ isEntering: true, isExiting: false }),
      }}
    >
      {children}
    </Overlay>
  );
};

export { Popover };
export type { PopoverProps };
