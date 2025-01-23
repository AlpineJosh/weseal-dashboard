import type { ComponentType } from "react";
import { Label } from "react-aria-components";

import type { FieldProps } from "..";
import type { ControlTypeProps } from "../control/control.component";
import { Description, Message } from "..";
import { Field } from "./field.component";

export type FieldTypeProps = FieldProps & {
  label: string;
  description?: string;
  help?: string;
};

export function withField<TValue>(
  ControlComponent: ComponentType<ControlTypeProps<TValue>>,
) {
  function FieldComponent({
    label,
    description,
    help,
    ...props
  }: FieldTypeProps) {
    return (
      <Field {...props}>
        <Label>{label}</Label>
        <Description>{description}</Description>
        <ControlComponent />
        <Message>{help}</Message>
      </Field>
    );
  }

  FieldComponent.displayName = `${ControlComponent.displayName ?? ControlComponent.name}Field`;

  return FieldComponent;
}
