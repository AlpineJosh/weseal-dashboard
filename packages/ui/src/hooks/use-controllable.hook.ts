import { useCallback, useMemo, useState } from "react";

interface Controlled<T> {
  value: T;
  defaultValue?: never;
  onChange: (value: T) => void;
}

interface Uncontrolled<T> {
  value?: never;
  defaultValue: T;
  onChange?: (value: T) => void;
}

export type Controllable<T> = Controlled<T> | Uncontrolled<T>;

export interface ControllableOptions {
  requiresState?: boolean;
}

interface ControllableProps<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}

export type ControllableState<T> = [
  value: T,
  setValue: (next: T | ((prev: T) => T)) => void,
];

export function useControllable<T>(
  { value, onChange, defaultValue }: ControllableProps<T>,
  options?: ControllableOptions,
): ControllableState<T> {
  const isControlled = value !== undefined;

  const initialValue = (value ?? defaultValue) as T;

  const [uncontrolledValue, setUncontrolledValue] = useState<T>(initialValue);

  const currentValue = useMemo(() => {
    if (isControlled) {
      return value as T;
    }
    if (options?.requiresState) {
      return uncontrolledValue;
    }
    return defaultValue as T;
  }, [isControlled, value, defaultValue, uncontrolledValue, options]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const nextValue =
        typeof next === "function"
          ? (next as (prev: T) => T)(currentValue)
          : next;
      if (!isControlled && options?.requiresState) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [onChange, currentValue, isControlled, options],
  );

  return [currentValue, setValue];
}
