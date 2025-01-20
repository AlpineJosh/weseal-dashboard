import { createContext, useContext, useState } from "react";

export interface DialogContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};

interface DialogProviderProps {
  children: (controls: DialogContextValue) => React.ReactNode;
}

export const DialogProvider = ({ children }: DialogProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const value: DialogContextValue = {
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    isOpen,
  };

  return (
    <DialogContext.Provider value={value}>
      {children(value)}
    </DialogContext.Provider>
  );
};
