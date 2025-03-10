"use client";

import { cv } from "@/utilities";

import type { InputTypeProps } from "../../form/input";
import { useControllable } from "../../../hooks/use-controllable.hook";
import { withControl } from "../../form/control/control.component";
import { withField } from "../../form/field/with-field.hoc";
import { Input } from "../../form/input";

const variants = cv({
  base: ["relative block w-full appearance-none rounded-lg focus:outline-none"],
});

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
        className={variants()}
      />
    </Input>
  );
};

export const TextControl = withControl(TextInput);

export const TextField = withField(TextControl);
