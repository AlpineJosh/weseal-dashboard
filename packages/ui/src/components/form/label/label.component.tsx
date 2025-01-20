import type { LabelProps as AriaLabelProps } from "react-aria-components";
import * as Aria from "react-aria-components";

import { cn } from "@repo/ui/lib/class-merge";

import { useLabel } from "./label.hook";

export type LabelProps = AriaLabelProps;

export const Label = ({ id, className, ...props }: LabelProps) => {
  const labelProps = useLabel(id);

  return (
    <Aria.Label
      data-slot="label"
      className={cn("invalid:text-destructive", className)}
      {...labelProps}
      {...props}
    />
  );
};
Label.displayName = "Field.Label";
