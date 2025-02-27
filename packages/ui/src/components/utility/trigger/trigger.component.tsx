import React, { isValidElement } from "react";

import { useTrigger } from "./trigger.context";

interface TriggerProps {
  children: React.ReactElement<{
    onClick: ((e: React.MouseEvent) => void) | undefined;
    ref: (node: HTMLElement | null) => void | undefined;
  }>;
}

export const Trigger = ({ children }: TriggerProps) => {
  const { ref, onClick } = useTrigger();

  if (!isValidElement(children)) {
    throw new Error("PopoverTrigger must have exactly one child element");
  }

  const child = React.cloneElement(children, {
    ref,
    onClick: (e: React.MouseEvent) => {
      onClick(e);
      children.props.onClick?.(e);
    },
  });

  return child;
};
