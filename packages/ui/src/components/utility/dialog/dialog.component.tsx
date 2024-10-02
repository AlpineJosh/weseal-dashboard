"use client";

import React from "react";
import * as Aria from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

type DialogTriggerProps = Aria.DialogTriggerProps;
const Trigger = Aria.DialogTrigger;

type DialogProps = Aria.DialogProps;
const Content = ({ className, ...props }: Aria.DialogProps) => {
  return (
    <Aria.Dialog
      className={cn(
        // "relative max-h-[inherit] overflow-auto p-6 outline outline-0 [[data-placement]>&]:p-4",
        className,
      )}
      {...props}
    />
  );
};

export const Dialog = { Trigger, Content };

export type { DialogTriggerProps, DialogProps };
