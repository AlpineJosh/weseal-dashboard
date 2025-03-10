import { useId as useReactId } from "react";

export const useId = (id?: string): string => {
  const generatedId = useReactId();
  return id ?? generatedId;
};
