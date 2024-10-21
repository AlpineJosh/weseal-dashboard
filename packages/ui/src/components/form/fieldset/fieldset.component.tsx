import type { ComponentPropsWithoutRef } from "react";
import React from "react";

import { cn } from "../../../lib/class-merge";

type FieldsetProps = ComponentPropsWithoutRef<"fieldset">;

const Root = ({ children, className, ...props }: FieldsetProps) => {
  return (
    <fieldset
      {...props}
      className={cn(
        "[&>*+[data-slot=control]]:mt-6 [&>[data-slot=text]]:mt-1",
        className,
      )}
    >
      {children}
    </fieldset>
  );
};

Root.displayName = "Fieldset";

type LegendProps = ComponentPropsWithoutRef<"legend">;

const Legend = ({ children, className, ...props }: LegendProps) => {
  return (
    <legend
      {...props}
      className={cn(
        "text-base/6 font-semibold text-content data-[disabled]:opacity-50 sm:text-sm/6",
        className,
      )}
    >
      {children}
    </legend>
  );
};
Legend.displayName = "Fieldset.Legend";

export const Fieldset = Object.assign(Root, {
  Legend,
});

export type { FieldsetProps, LegendProps };
