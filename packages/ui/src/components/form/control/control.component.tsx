import type { ComponentType, ReactNode } from "react";

import type { InputTypeProps } from "../input/input.component";
import { useControl } from "./control.hook";

export interface ControlProps<TValue> {
  children: (props: InputTypeProps<TValue>) => ReactNode;
}

export type ControlTypeProps<TValue> = Omit<
  InputTypeProps<TValue>,
  "value" | "defaultValue" | "onChange" | "onBlur" | "name"
>;

export function Control<TValue>({ children, ...props }: ControlProps<TValue>) {
  const inputProps = useControl();

  return children({ ...props, ...inputProps });
}

export function withControl<TValue>(
  InputComponent: ComponentType<InputTypeProps<TValue>>,
) {
  function ControlComponent(props: ControlTypeProps<TValue>) {
    return (
      <Control<TValue> {...props}>
        {(controlProps) => <InputComponent {...controlProps} />}
      </Control>
    );
  }

  // Set display name for better debugging
  ControlComponent.displayName = `${InputComponent.displayName ?? InputComponent.name}Control`;

  return ControlComponent;
}
