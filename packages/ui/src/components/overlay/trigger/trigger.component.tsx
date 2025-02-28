import React from "react";

import { useReferenceProps } from "../floating/floating.context";

interface TriggerProps {
  children: React.ReactElement;
}

export const Trigger = ({ children }: TriggerProps) => {
  const { getProps } = useReferenceProps();

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, getProps());
  });
};

export const AnchorTrigger = ({ children }: TriggerProps) => {
  const { getProps, setRef } = useReferenceProps();

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, { ref: setRef, ...getProps() });
  });
};
