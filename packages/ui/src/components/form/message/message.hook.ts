import { useEffect } from "react";

import { useField } from "../field/field.hook";

export const useMessage = (id?: string) => {
  const { ids, setIds, fieldState } = useField();

  useEffect(() => {
    if (id && id !== ids.messageId) {
      setIds((draft) => {
        draft.messageId = id;
      });
    }
  }, [id, setIds, ids.messageId]);

  return {
    props: {
      id: ids.messageId,
      role: "alert",
    },
    error: fieldState.error,
  };
};
