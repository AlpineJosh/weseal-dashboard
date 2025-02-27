import { useCallback, useMemo, useState } from "react";

interface UseControllableProps<T> {
  value?: T;
  onChange?: (value: T | undefined) => void;
  defaultValue?: T;
  requiresState?: boolean;
}

export function useControllable<T>({
  value,
  onChange,
  defaultValue,
  requiresState = false,
}: UseControllableProps<T>): [
  value: T | undefined,
  setValue: (
    next: T | undefined | ((prev: T | undefined) => T | undefined),
  ) => void,
] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(
    defaultValue,
  );

  const isControlled = value !== undefined;
  const currentValue = useMemo(() => {
    if (isControlled) {
      return value;
    }
    if (requiresState) {
      return uncontrolledValue;
    }
    return defaultValue;
  }, [isControlled, value, defaultValue, uncontrolledValue, requiresState]);

  const setValue = useCallback(
    (next: T | undefined | ((prev: T | undefined) => T | undefined)) => {
      const nextValue =
        typeof next === "function"
          ? (next as (prev: T | undefined) => T | undefined)(currentValue)
          : next;
      if (!isControlled && requiresState) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [onChange, currentValue, isControlled, requiresState],
  );

  return [currentValue, setValue];
}
