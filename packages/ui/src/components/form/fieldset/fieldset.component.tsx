import type { ComponentPropsWithoutRef } from "react";
import React, { forwardRef } from "react";

export const Root = forwardRef<
  HTMLFieldSetElement,
  ComponentPropsWithoutRef<"fieldset">
>(({ children, ...props }, ref) => {
  return (
    <fieldset ref={ref} {...props}>
      {children}
    </fieldset>
  );
});

Root.displayName = "Fieldset.Root";

export const Legend = forwardRef<
  HTMLLegendElement,
  ComponentPropsWithoutRef<"legend">
>(({ children, ...props }, ref) => {
  return (
    <legend ref={ref} {...props}>
      {children}
    </legend>
  );
});

Legend.displayName = "Fieldset.Legend";

export const Fieldset = {
  Root,
  Legend,
};
