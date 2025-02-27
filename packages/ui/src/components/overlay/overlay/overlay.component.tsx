import { useImmer } from "use-immer";

import type {
  OverlaySheetContextValues,
  OverlayTriggerContextValues,
} from "./overlay.context";
import { OverlayContext } from "./overlay.context";

export interface OverlayControls {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export type OverlayChildren =
  | React.ReactNode
  | ((controls: OverlayControls) => React.ReactNode);

export interface OverlayProps {
  children: OverlayChildren;
  isModal?: boolean;
  trigger?: OverlayTriggerContextValues;
  sheet: OverlaySheetContextValues;
}

export const Overlay = ({
  children,
  isModal = false,
  trigger,
  sheet,
}: OverlayProps) => {
  const [isOpen, setOpen] = useImmer(false);

  const controls = {
    isOpen,
    open: () => setOpen(true),
    close: () => setOpen(false),
  };

  return (
    <OverlayContext.Provider
      value={{
        controls,
        isModal,
        trigger,
        sheet,
      }}
    >
      {typeof children === "function" ? children(controls) : children}
    </OverlayContext.Provider>
  );
};
