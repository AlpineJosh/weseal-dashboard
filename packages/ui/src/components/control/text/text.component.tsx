"use client";

import { cva } from "class-variance-authority";

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

export type TextInputProps = InputTypeProps<string>;

export const TextInput = ({
  className,
  value,
  onChange,
  defaultValue = "",
  ...props
}: TextInputProps) => {
  const [controlledValue, setControlledValue] = useControllable({
    value,
    onChange,
    defaultValue,
  });

  return (
    <Input className={className}>
      <input
        {...props}
        type="text"
        value={controlledValue}
        onChange={(event) => setControlledValue(event.target.value)}
        className={cn(variants.input())}
      />
    </Input>
  );
};

export const TextControl = withControl(TextInput);

export const TextField = withField(TextControl);
