"use client";

import {
  Tooltip as AriaTooltip,
  TooltipProps,
  TooltipTrigger,
  TooltipTriggerComponentProps,
} from "react-aria-components";

import { Button } from "@repo/ui/components/element/button";
import { cn } from "@repo/ui/lib/class-merge";

const Tip = ({ className, offset = 5, ...props }: TooltipProps) => {
  return (
    <AriaTooltip
      className={cn(
        "rounded-sm bg-foreground/75 px-1.5 py-0.5 text-xs text-background",
        className,
      )}
      offset={offset}
      {...props}
    />
  );
};

export const Tooltip = Object.assign(TooltipTrigger, {
  Tip,
  Button,
});

export type {
  TooltipTriggerComponentProps as TooltipProps,
  TooltipProps as TooltipTipProps,
};
