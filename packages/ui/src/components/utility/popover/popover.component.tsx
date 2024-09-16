import type { PopoverProps as AriaPopoverProps } from "react-aria-components";
import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import {
  Popover as AriaPopover,
  PopoverContext,
  useSlottedContext,
} from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

export interface PopoverProps extends Omit<AriaPopoverProps, "children"> {
  showArrow?: boolean;
  children: React.ReactNode;
}

const styles = cva(
  cn(
    "bg-popover/30 text-popover-foreground rounded-lg border border-border bg-card shadow-lg",
    "backdrop-blur-2xl backdrop-saturate-200",
  ),
  {
    variants: {
      isEntering: {
        true: "placement-bottom:slide-in-from-top-1 placement-top:slide-in-from-bottom-1 placement-left:slide-in-from-right-1 placement-right:slide-in-from-left-1 duration-200 ease-out animate-in fade-in",
      },
      isExiting: {
        true: "placement-bottom:slide-out-to-top-1 placement-top:slide-out-to-bottom-1 placement-left:slide-out-to-right-1 placement-right:slide-out-to-left-1 duration-150 ease-in animate-out fade-out",
      },
    },
  },
);

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  ({ children, showArrow, className, ...props }, ref) => {
    const popoverContext = useSlottedContext(PopoverContext);
    const isSubmenu = popoverContext?.trigger === "SubmenuTrigger";
    let offset = showArrow ? 12 : 8;
    offset = isSubmenu ? offset - 6 : offset;
    return (
      <AriaPopover
        ref={ref}
        onOpenChange={console.log}
        offset={offset}
        {...props}
        className={cn(
          styles({ isEntering: props.isEntering, isExiting: props.isExiting }),
          className,
        )}
      >
        {children}
      </AriaPopover>
    );
  },
);
