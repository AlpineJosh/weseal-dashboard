import type { ComponentPropsWithRef, ComponentType } from "react";
import { useId } from "react";
import { cva } from "class-variance-authority";
import { Label } from "react-aria-components";
import { useController } from "react-hook-form";
import { useImmer } from "use-immer";

import { cn } from "@repo/ui/lib/class-merge";

import type { ControlTypeProps } from "../control/control.component";
import type { FieldIds } from "./field.hook";
import { Description, Message } from "..";
import { FieldContext } from "./field.hook";

const variants = cva("flex flex-col", {
  variants: {
    layout: {
      row: "grid grid-cols-[var(--grid-cols)] items-center",
      column: [
        "flex flex-col",
        "[&>[data-slot=label]+[data-slot=control]]:mt-3",
        "[&>[data-slot=label]+[data-slot=description]]:mt-1",
        "[&>[data-slot=description]+[data-slot=control]]:mt-3",
        "[&>[data-slot=control]+[data-slot=description]]:mt-3",
        "[&>[data-slot=control]+[data-slot=error]]:mt-3",
        "[&>[data-slot=label]]:font-medium",
      ],
    },
  },
});

export type FieldProps = ComponentPropsWithRef<"div"> & {
  name: string;
  layout?: "row" | "column";
};

export const Field = ({
  id,
  name,
  children,
  className,
  layout = "column",
  ...props
}: FieldProps) => {
  const control = useController({ name });

  const fieldId = useId();
  id ??= fieldId;

  const [ids, setIds] = useImmer<FieldIds>({
    fieldId: fieldId,
    controlId: undefined,
    labelId: undefined,
    descriptionId: undefined,
    messageId: undefined,
  });

  return (
    <FieldContext.Provider value={{ ids, setIds, ...control }}>
      <div className={cn(variants({ layout }), className)} {...props}>
        {children}
      </div>
    </FieldContext.Provider>
  );
};
