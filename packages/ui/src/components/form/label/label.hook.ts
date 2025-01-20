import { useEffect } from "react";

import { useField } from "../field/field.hook";

export const useLabel = (id?: string) => {
  const { ids, setIds } = useField();

  useEffect(() => {
    if (id && id !== ids.labelId) {
      setIds((draft) => {
        draft.labelId = id;
      });
    }
  }, [id, setIds, ids.labelId]);

  return {
    id: ids.labelId,
    htmlFor: ids.controlId,
  };
};
