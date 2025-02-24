import { useCallback, useMemo } from "react";

interface UseControllableProps<T> {
  value?: T;
  onChange?: (value: T | undefined) => void;
  defaultValue?: T;
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

  const isControlled = value !== undefined;
  const currentValue = useMemo(
    () => (isControlled ? value : defaultValue),
    [isControlled, value, defaultValue],
  );

  const setValue = useCallback(
    (next: T | undefined | ((prev: T | undefined) => T | undefined)) => {
      const nextValue =
        typeof next === "function"
          ? (next as (prev: T | undefined) => T | undefined)(currentValue)
          : next;

      onChange?.(nextValue);
    },
    [onChange, currentValue],
  );

  return [currentValue, setValue];
}
