"use client";

import { cva } from "class-variance-authority";
import { Decimal } from "decimal.js";

import { cn } from "@repo/ui/lib/class-merge";

import type { InputTypeProps } from "../../form/input";
import { withControl } from "../../form/control/control.component";
import { withField } from "../../form/field/with-field.hoc";
import { Input } from "../../form/input";
import { useControllable } from "../../utility/hooks/useControllable.hook";

const variants = {
  input: cva([
    "relative block w-full appearance-none rounded-lg focus:outline-none",
  ]),
};

export type NumberInputProps = InputTypeProps<Decimal>;

export const NumberInput = ({
  name,
  value,
  onChange,
  onBlur,
  defaultValue = new Decimal(0),
  disabled,
  invalid,
  ...props
}: NumberInputProps) => {
  const [controlledValue, setControlledValue] = useControllable({
    value,
    onChange,
    defaultValue,
  });
  return (
    <Input {...props}>
      <input
        name={name}
        type="number"
        value={controlledValue?.toString()}
        onChange={(event) =>
          setControlledValue(new Decimal(event.target.value))
        }
        onBlur={onBlur}
        disabled={disabled}
        data-disabled={disabled}
        data-invalid={invalid}
        className={cn(variants.input())}
      />
    </Input>
  );
};

export const NumberControl = withControl(NumberInput);

export const NumberField = withField(NumberControl);
