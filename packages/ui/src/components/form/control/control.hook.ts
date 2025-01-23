import { useEffect } from "react";

import { useField } from "../field/field.hook";

export const useControl = <T = unknown>(id?: string) => {
  const { field, fieldState, ids, setIds } = useField<T>();

  useEffect(() => {
    if (id && id !== ids.controlId) {
      setIds((draft) => {
        draft.controlId = id;
      });
    }
  }, [id, setIds, ids.controlId]);

  return {
    id: ids.controlId,
    // Core ARIA attributes
    "aria-labelledby": ids.labelId,
    "aria-describedby": fieldState.error
      ? `${ids.descriptionId} ${ids.messageId}`
      : ids.descriptionId,
    // State-based ARIA attributes
    "aria-invalid": fieldState.invalid,
    "aria-errormessage": fieldState.error ? ids.messageId : undefined,
    invalid: fieldState.invalid,
    ...field,
  };
};
