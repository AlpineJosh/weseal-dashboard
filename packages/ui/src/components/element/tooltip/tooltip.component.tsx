"use client";

import React from "react";
import * as Aria from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

type TipProps = Aria.TooltipProps;

const Tip = ({ className, offset = 5, ...props }: TipProps) => {
  return (
    <Aria.Tooltip
      className={cn(
        "rounded-sm bg-content/75 px-1.5 py-0.5 text-xs text-background",
      )}
      offset={offset}
      {...props}
    />
  );
};

type TooltipProps = Aria.TooltipTriggerComponentProps;
const Trigger = Aria.TooltipTrigger;

export const Tooltip = Object.assign(Trigger, {
  Tip,
});

export type { TooltipProps, TipProps };
