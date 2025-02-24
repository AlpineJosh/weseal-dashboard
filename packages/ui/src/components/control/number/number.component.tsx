"use client";

import { cva } from "class-variance-authority";
import { Decimal } from "decimal.js";
import { useImmer } from "use-immer";

import { cn } from "@repo/ui/lib/class-merge";

import type { InputTypeProps } from "../../form/input";
import { withControl } from "../../form/control/control.component";
import { withField } from "../../form/field/with-field.hoc";
import { Input } from "../../form/input";
import { useControllable } from "../../utility/hooks/useControllable.hook";

const variants = {
  input: cva([
    "relative block w-full appearance-none text-right tabular-nums focus:outline-none",
  ]),
};

export type NumberInputProps = InputTypeProps<Decimal | null>;

export const NumberInput = ({
  className,
  value,
  onChange,
  defaultValue = null,
  ...props
}: NumberInputProps) => {
  const [precision, setPrecision] = useImmer(defaultValue?.precision() ?? 1);

  const [controlledValue, setControlledValue] = useControllable({
    value,
    onChange,
    defaultValue,
  });

  return (
    <Input className={className}>
      <input
        {...props}
        type="number"
        value={controlledValue?.toPrecision(precision)}
        onChange={(event) => {
          const value = event.target.value;
          if (value === "" || !isFinite(Number(value))) {
            setControlledValue(null);
            setPrecision(1);
          } else {
            const inputPrecision = value.replace(".", "").length;
            setPrecision(inputPrecision);
            setControlledValue(new Decimal(value));
          }
        }}
        className={cn(variants.input())}
      />
    </Input>
  );
};

export const NumberControl = withControl(NumberInput);

export const NumberField = withField(NumberControl);
