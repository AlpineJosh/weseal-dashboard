import type { ReferenceType } from "@floating-ui/react-dom";
import { createContext, useContext } from "react";

interface TriggerContextValue {
  ref: (node: ReferenceType | null) => void;
  onClick: (event: React.MouseEvent) => void;
}

export const TriggerContext = createContext<TriggerContextValue | null>(null);

export const TriggerProvider = ({
  value,
  children,
}: {
  value: TriggerContextValue;
  children: React.ReactNode;
}) => {
  return (
    <TriggerContext.Provider value={value}>{children}</TriggerContext.Provider>
  );
};

export const useTrigger = () => {
  const context = useContext(TriggerContext);
  if (!context) {
    throw new Error("useTrigger must be used within a TriggerProvider");
  }
  return context;
};
