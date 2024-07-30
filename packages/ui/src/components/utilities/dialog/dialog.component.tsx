"use client";

import type { DialogProps, DialogTriggerProps } from "react-aria-components";
import { cn } from "@/lib/class-merge";
import {
  Dialog as DialogPrimitive,
  DialogTrigger,
} from "react-aria-components";

const Trigger = DialogTrigger;

const Content = ({ className, ...props }: DialogProps) => {
  return (
    <DialogPrimitive
      className={cn(
        "relative max-h-[inherit] overflow-auto p-6 outline outline-0 [[data-placement]>&]:p-4",
        className,
      )}
      {...props}
    />
  );
};

export const Dialog = {
  Trigger,
  Content,
};

export type { DialogTriggerProps, DialogProps as DialogContentProps };
