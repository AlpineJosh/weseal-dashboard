import { useCallback } from "react";
import { useImmer } from "use-immer";

interface UseControllableProps<T> {
  value?: T;
  onChange?: (value: T | undefined) => void;
  defaultValue: T;
}

export function useControllable<T>(
  props: UseControllableProps<T>,
): [
  value: T | undefined,
  setValue: (
    next: T | undefined | ((prev: T | undefined) => T | undefined),
  ) => void,
] {
  const { value, onChange, defaultValue } = props;
  const [uncontrolledValue, setUncontrolledValue] = useImmer(defaultValue);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const setValue = useCallback(
    (next: T | undefined | ((prev: T | undefined) => T | undefined)) => {
      const nextValue =
        typeof next === "function"
          ? (next as (prev: T | undefined) => T | undefined)(currentValue)
          : next;

      if (!isControlled) {
        setUncontrolledValue(nextValue ?? defaultValue);
      }
      onChange?.(nextValue);
    },
    [isControlled, onChange, currentValue, setUncontrolledValue, defaultValue],
  );

  return [currentValue, setValue];
}
