import type { ControlProps } from "../form/control/control.component";

export type ControlInputProps<TValue> = Omit<
  ControlProps,
  "value" | "onChange" | "defaultValue"
> & {
  value?: TValue;
  onChange?: (value?: TValue) => void;
  defaultValue: TValue;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
};
