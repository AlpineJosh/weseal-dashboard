import type { UseControllerReturn } from "react-hook-form";
import { createContext, useContext } from "react";

export interface FieldIds {
  fieldId: string;
  controlId: string | undefined;
  labelId: string | undefined;
  descriptionId: string | undefined;
  messageId: string | undefined;
}

interface FieldContextValue<TValue> extends UseControllerReturn {
  ids: FieldIds;
  setIds: (fn: (draft: FieldIds) => void) => void;
  field: Omit<UseControllerReturn["field"], "value"> & {
    value: TValue | undefined;
  };
}

export const FieldContext = createContext<FieldContextValue<unknown> | null>(
  null,
);

export const useField = <TValue>() => {
  const context = useContext(FieldContext);
  if (!context) throw new Error("useField must be used within a Field");
  return context as FieldContextValue<TValue>;
};
