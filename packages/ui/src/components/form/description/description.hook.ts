import { useEffect } from "react";

import { useField } from "../field/field.hook";

export const useDescription = (id?: string) => {
  const { ids, setIds } = useField();

  useEffect(() => {
    if (id && id !== ids.descriptionId) {
      setIds((draft) => {
        draft.descriptionId = id;
      });
    }
  }, [id, setIds, ids.descriptionId]);

  return {
    id: ids.descriptionId,
  };
};
