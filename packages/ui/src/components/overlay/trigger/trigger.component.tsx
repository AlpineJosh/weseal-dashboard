import React, { isValidElement } from "react";

import { useOverlay } from "../overlay/overlay.context";

interface TriggerProps {
  children: React.ReactElement<{
    onClick: ((e: React.MouseEvent) => void) | undefined;
    ref: (node: HTMLElement | null) => void | undefined;
  }>;
}

export const Trigger = ({ children }: TriggerProps) => {
  const { trigger, controls } = useOverlay();

  if (!trigger) {
    throw new Error(
      "Trigger must be used within an Overlay that defines a trigger",
    );
  }

  if (!isValidElement(children)) {
    throw new Error("PopoverTrigger must have exactly one child element");
  }

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      ref: trigger.setReference,
      onClick: (e: React.MouseEvent) => {
        controls.open();
        child.props.onClick?.(e);
      },
    });
  });
};
