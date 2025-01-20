import type {
  Placement,
  ReferenceType,
  Strategy,
} from "@floating-ui/react-dom";
import type { CSSProperties } from "react";
import { createContext, useContext } from "react";
import { useFloating } from "@floating-ui/react-dom";

import type { DialogContextValue } from "../dialog/dialog.context";
import { DialogProvider } from "../dialog/dialog.context";

export interface PopoverContextValue {
  controls: DialogContextValue;
  trigger: {
    ref: (node: ReferenceType | null) => void;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };
  popover: {
    ref: (node: HTMLElement | null) => void;
    styles: CSSProperties;
  };
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

export const usePopover = () => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error("usePopover must be used within a PopoverProvider");
  }
  return context;
};

interface PopoverProviderProps {
  children:
    | React.ReactNode
    | ((controls: DialogContextValue) => React.ReactNode);
  placement?: Placement;
  strategy?: Strategy;
}

export const PopoverProvider = ({
  children,
  placement = "bottom",
  strategy = "fixed",
}: PopoverProviderProps) => {
  const { refs, floatingStyles } = useFloating({
    placement,
    strategy,
  });

  return (
    <DialogProvider>
      {(controls) => (
        <PopoverContext.Provider
          value={{
            controls,
            trigger: {
              ref: refs.setReference,
              onClick: controls.open,
            },
            popover: {
              ref: refs.setFloating,
              styles: floatingStyles,
            },
          }}
        >
          {typeof children === "function" ? children(controls) : children}
        </PopoverContext.Provider>
      )}
    </DialogProvider>
  );
};
