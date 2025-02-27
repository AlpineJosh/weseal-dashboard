import type { ReferenceType, VirtualElement } from "@floating-ui/react-dom";
import type { CSSProperties, MutableRefObject } from "react";
import { createContext, useContext } from "react";

export interface OverlayTriggerContextValues {
  ref: MutableRefObject<ReferenceType | null>;
  setReference: (node: Element | VirtualElement | null) => void;
}

export interface OverlaySheetContextValues {
  ref: MutableRefObject<HTMLDialogElement | null>;
  setReference: (node: HTMLDialogElement | null) => void;
  styles: CSSProperties;
  className?: string;
}

export interface OverlayControls {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export interface OverlayContextValues {
  isModal: boolean;
  trigger?: OverlayTriggerContextValues;
  sheet: OverlaySheetContextValues;
  controls: OverlayControls;
}

export const OverlayContext = createContext<OverlayContextValues | undefined>(
  undefined,
);

export const useOverlay = () => {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error("useOverlay must be used within a OverlayProvider");
  }
  return context;
};
