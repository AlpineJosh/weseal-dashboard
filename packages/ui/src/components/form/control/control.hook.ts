import { useEffect } from "react";

import type { InputTypeProps } from "../input/input.component";
import { useField } from "../field/field.hook";

export const useControl = <TValue>(id?: string): InputTypeProps<TValue> => {
  const { field, fieldState, ids, setIds } = useField<TValue>();

  useEffect(() => {
    if (id && id !== ids.controlId) {
      setIds((draft) => {
        draft.controlId = id;
      });
    }
  }, [id, setIds, ids.controlId]);

  return {
    id: ids.controlId,
    name: field.name,
    disabled: field.disabled,
    value: field.value,
    onChange: (value?: TValue) => {
      field.onChange({
        target: {
          value,
        },
      });
    },

    // Core ARIA attributes
    "aria-labelledby": ids.labelId,
    "aria-describedby": fieldState.error
      ? `${ids.descriptionId} ${ids.messageId}`
      : ids.descriptionId,
    // State-based ARIA attributes
    "aria-invalid": fieldState.invalid,
    "aria-errormessage": fieldState.error ? ids.messageId : undefined,
    "data-invalid": fieldState.invalid,
  };
};
